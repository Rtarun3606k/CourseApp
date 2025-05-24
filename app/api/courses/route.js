// API endpoint for course management
// Handles CRUD operations for courses with proper validation and error handling

import { NextResponse } from "next/server";
import { getDatabase } from "@/utils/MongoDB";
import { CourseValidator, ValidationError } from "@/utils/validation";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

/**
 * Verify JWT token and extract user information
 */
async function verifyAuth(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return { error: "Authentication required", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
}

/**
 * Check if user has admin permissions
 */
async function checkAdminPermissions(userId) {
  try {
    const { Users } = await getDatabase();
    const user = await Users.findOne({ _id: new ObjectId(userId) });

    return user && (user.role === "admin" || user.isAdmin === true);
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
}

/**
 * GET /api/courses - Retrieve courses with filtering and pagination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50); // Max 50 per page
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const isPublished = searchParams.get("published");
    const instructorId = searchParams.get("instructorId");

    const { Courses } = await getDatabase();

    // Build query filter
    const filter = {};

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (isPublished !== null) filter.isPublished = isPublished === "true";
    if (instructorId) filter.instructorId = new ObjectId(instructorId);

    // Add text search if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [courses, totalCount] = await Promise.all([
      Courses.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      Courses.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses - Create a new course (Admin only)
 */
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    // Check admin permissions
    const isAdmin = await checkAdminPermissions(authResult.user.userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const courseData = await request.json();

    // Set instructor information from authenticated user
    if (!courseData.instructorId) {
      courseData.instructorId = authResult.user.userId;
    }
    if (!courseData.instructor) {
      courseData.instructor = authResult.user.name || authResult.user.email;
    }

    // Validate course data
    const validatedData = CourseValidator.validate(courseData, false);

    // Set default values
    validatedData.isActive = validatedData.isActive ?? true;
    validatedData.isPublished = validatedData.isPublished ?? false;

    // Insert into database
    const { Courses } = await getDatabase();
    const result = await Courses.insertOne(validatedData);

    // Fetch the created course
    const createdCourse = await Courses.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        data: createdCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, field: error.field },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create course",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses - Update an existing course (Admin only)
 */
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    // Check admin permissions
    const isAdmin = await checkAdminPermissions(authResult.user.userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const { courseId, ...updateData } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Validate course ID
    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID format" },
        { status: 400 }
      );
    }

    // Validate update data
    const validatedData = CourseValidator.validate(updateData, true);

    // Update course
    const { Courses } = await getDatabase();
    const result = await Courses.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      { $set: validatedData },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: result.value,
    });
  } catch (error) {
    console.error("Error updating course:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, field: error.field },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update course",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses - Delete a course (Admin only)
 */
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    // Check admin permissions
    const isAdmin = await checkAdminPermissions(authResult.user.userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Valid course ID is required" },
        { status: 400 }
      );
    }

    const { Courses, Units, Questions, UserProgress } = await getDatabase();

    // Check if course exists
    const course = await Courses.findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Delete related data in order: Questions -> Units -> UserProgress -> Course
    await Questions.deleteMany({ courseId: new ObjectId(courseId) });
    await Units.deleteMany({ courseId: new ObjectId(courseId) });
    await UserProgress.deleteMany({ courseId: new ObjectId(courseId) });
    await Courses.deleteOne({ _id: new ObjectId(courseId) });

    return NextResponse.json({
      success: true,
      message: "Course and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete course",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
