import { ObjectId } from "mongodb";

// Course Schema
export const CourseSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "instructor", "category", "level"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 3,
          maxLength: 200,
          description: "Course title is required and must be 3-200 characters",
        },
        description: {
          bsonType: "string",
          minLength: 10,
          maxLength: 1000,
          description:
            "Course description is required and must be 10-1000 characters",
        },
        instructor: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Instructor name is required",
        },
        instructorId: {
          bsonType: "objectId",
          description: "Reference to instructor user",
        },
        category: {
          bsonType: "string",
          enum: [
            "Technology",
            "Business",
            "Design",
            "Marketing",
            "Health",
            "Education",
            "Other",
          ],
          description: "Course category must be one of the predefined values",
        },
        level: {
          bsonType: "string",
          enum: ["Beginner", "Intermediate", "Advanced"],
          description:
            "Course level must be Beginner, Intermediate, or Advanced",
        },
        duration: {
          bsonType: "string",
          description: "Estimated course duration",
        },
        thumbnail: {
          bsonType: "string",
          description: "Course thumbnail URL",
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Course price must be non-negative",
        },
        currency: {
          bsonType: "string",
          enum: ["USD", "EUR", "GBP", "INR"],
          description: "Currency code",
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          description: "Array of course tags",
        },
        isActive: {
          bsonType: "bool",
          description: "Course active status",
        },
        isPublished: {
          bsonType: "bool",
          description: "Course publication status",
        },
        createdAt: {
          bsonType: "date",
          description: "Course creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
      },
    },
  },
};

// Unit Schema
export const UnitSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["courseId", "title", "order"],
      properties: {
        courseId: {
          bsonType: "objectId",
          description: "Reference to parent course is required",
        },
        title: {
          bsonType: "string",
          minLength: 3,
          maxLength: 200,
          description: "Unit title is required and must be 3-200 characters",
        },
        description: {
          bsonType: "string",
          maxLength: 500,
          description: "Unit description",
        },
        content: {
          bsonType: "string",
          maxLength: 50000,
          description: "Unit content in Markdown format",
        },
        order: {
          bsonType: "int",
          minimum: 1,
          description: "Unit order within course",
        },
        estimatedDuration: {
          bsonType: "string",
          description: "Estimated completion time",
        },
        isActive: {
          bsonType: "bool",
          description: "Unit active status",
        },
        media: {
          bsonType: "object",
          properties: {
            type: {
              bsonType: "string",
              enum: ["video", "audio", "image", "pdf"],
            },
            url: {
              bsonType: "string",
            },
            duration: {
              bsonType: "int",
              minimum: 0,
            },
            thumbnail: {
              bsonType: "string",
            },
          },
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
  },
};

// Question Schema
export const QuestionSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["unitId", "courseId", "type", "questionText", "order"],
      properties: {
        unitId: {
          bsonType: "objectId",
          description: "Reference to parent unit is required",
        },
        courseId: {
          bsonType: "objectId",
          description: "Reference to course is required",
        },
        type: {
          bsonType: "string",
          enum: ["MCQ", "FILL_BLANK", "TEXT", "AUDIO"],
          description: "Question type must be one of the predefined values",
        },
        questionText: {
          bsonType: "string",
          minLength: 10,
          maxLength: 1000,
          description: "Question text is required",
        },
        explanation: {
          bsonType: "string",
          maxLength: 1000,
          description: "Explanation for the correct answer",
        },
        points: {
          bsonType: "int",
          minimum: 1,
          maximum: 100,
          description: "Points awarded for correct answer",
        },
        difficulty: {
          bsonType: "string",
          enum: ["easy", "medium", "hard"],
          description: "Question difficulty level",
        },
        order: {
          bsonType: "int",
          minimum: 1,
          description: "Question order within unit",
        },
        isActive: {
          bsonType: "bool",
          description: "Question active status",
        },
        media: {
          bsonType: "object",
          properties: {
            type: {
              bsonType: "string",
              enum: ["image", "audio", "video"],
            },
            url: {
              bsonType: "string",
            },
            alt: {
              bsonType: "string",
            },
          },
        },
        questionData: {
          bsonType: "object",
          description: "Question type specific data",
        },
        createdAt: {
          bsonType: "date",
        },
        updatedAt: {
          bsonType: "date",
        },
      },
    },
  },
};

// User Progress Schema
export const UserProgressSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "courseId"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "Reference to user is required",
        },
        courseId: {
          bsonType: "objectId",
          description: "Reference to course is required",
        },
        enrolledAt: {
          bsonType: "date",
          description: "Enrollment timestamp",
        },
        lastAccessedAt: {
          bsonType: "date",
          description: "Last access timestamp",
        },
        completedAt: {
          bsonType: "date",
          description: "Course completion timestamp",
        },
        currentUnit: {
          bsonType: "objectId",
          description: "Current unit being studied",
        },
        completedUnits: {
          bsonType: "array",
          items: {
            bsonType: "objectId",
          },
          description: "Array of completed unit IDs",
        },
        questionAnswers: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              questionId: { bsonType: "objectId" },
              userAnswer: { description: "Student's answer (mixed type)" },
              isCorrect: { bsonType: "bool" },
              pointsEarned: { bsonType: "int" },
              answeredAt: { bsonType: "date" },
              timeSpent: { bsonType: "int" },
              attempts: { bsonType: "int" },
            },
          },
        },
        score: {
          bsonType: "object",
          properties: {
            totalPoints: { bsonType: "int" },
            earnedPoints: { bsonType: "int" },
            percentage: { bsonType: "number" },
          },
        },
        timeSpent: {
          bsonType: "int",
          minimum: 0,
          description: "Total time spent in course (seconds)",
        },
      },
    },
  },
};
