// Schema validation utilities for course management system
// Provides runtime validation and sanitization functions

import { ObjectId } from "mongodb";

/**
 * Validation error class for schema violations
 */
export class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

/**
 * Course data validation and sanitization
 */
export class CourseValidator {
  static validate(courseData, isUpdate = false) {
    const errors = [];
    const sanitized = { ...courseData };

    // Required field validation (skip for updates)
    if (!isUpdate) {
      const required = [
        "title",
        "description",
        "instructor",
        "category",
        "level",
      ];
      for (const field of required) {
        if (!sanitized[field]) {
          errors.push(`${field} is required`);
        }
      }
    }

    // Title validation
    if (sanitized.title !== undefined) {
      if (typeof sanitized.title !== "string") {
        errors.push("Title must be a string");
      } else if (sanitized.title.length < 3 || sanitized.title.length > 200) {
        errors.push("Title must be between 3 and 200 characters");
      } else {
        sanitized.title = sanitized.title.trim();
      }
    }

    // Description validation
    if (sanitized.description !== undefined) {
      if (typeof sanitized.description !== "string") {
        errors.push("Description must be a string");
      } else if (
        sanitized.description.length < 10 ||
        sanitized.description.length > 1000
      ) {
        errors.push("Description must be between 10 and 1000 characters");
      } else {
        sanitized.description = sanitized.description.trim();
      }
    }

    // Instructor validation
    if (sanitized.instructor !== undefined) {
      if (typeof sanitized.instructor !== "string") {
        errors.push("Instructor must be a string");
      } else if (
        sanitized.instructor.length < 2 ||
        sanitized.instructor.length > 100
      ) {
        errors.push("Instructor name must be between 2 and 100 characters");
      } else {
        sanitized.instructor = sanitized.instructor.trim();
      }
    }

    // InstructorId validation
    if (sanitized.instructorId !== undefined) {
      if (!ObjectId.isValid(sanitized.instructorId)) {
        errors.push("Invalid instructor ID format");
      } else {
        sanitized.instructorId = new ObjectId(sanitized.instructorId);
      }
    }

    // Category validation
    const validCategories = [
      "Technology",
      "Business",
      "Design",
      "Marketing",
      "Health",
      "Education",
      "Other",
    ];
    if (sanitized.category !== undefined) {
      if (!validCategories.includes(sanitized.category)) {
        errors.push(`Category must be one of: ${validCategories.join(", ")}`);
      }
    }

    // Level validation
    const validLevels = ["Beginner", "Intermediate", "Advanced"];
    if (sanitized.level !== undefined) {
      if (!validLevels.includes(sanitized.level)) {
        errors.push(`Level must be one of: ${validLevels.join(", ")}`);
      }
    }

    // Price validation
    if (sanitized.price !== undefined) {
      const price = Number(sanitized.price);
      if (isNaN(price) || price < 0) {
        errors.push("Price must be a non-negative number");
      } else {
        sanitized.price = price;
      }
    }

    // Currency validation
    const validCurrencies = ["USD", "EUR", "GBP", "INR"];
    if (sanitized.currency !== undefined) {
      if (!validCurrencies.includes(sanitized.currency)) {
        errors.push(`Currency must be one of: ${validCurrencies.join(", ")}`);
      }
    }

    // Tags validation
    if (sanitized.tags !== undefined) {
      if (!Array.isArray(sanitized.tags)) {
        errors.push("Tags must be an array");
      } else {
        sanitized.tags = sanitized.tags
          .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim());
      }
    }

    // Boolean field validation
    ["isActive", "isPublished"].forEach((field) => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = Boolean(sanitized[field]);
      }
    });

    // Add timestamps
    if (!isUpdate) {
      sanitized.createdAt = new Date();
    }
    sanitized.updatedAt = new Date();

    if (errors.length > 0) {
      throw new ValidationError(
        `Course validation failed: ${errors.join(", ")}`
      );
    }

    return sanitized;
  }
}

/**
 * Unit data validation and sanitization
 */
export class UnitValidator {
  static validate(unitData, isUpdate = false) {
    const errors = [];
    const sanitized = { ...unitData };

    // Required field validation
    if (!isUpdate) {
      const required = ["courseId", "title", "order"];
      for (const field of required) {
        if (!sanitized[field]) {
          errors.push(`${field} is required`);
        }
      }
    }

    // CourseId validation
    if (sanitized.courseId !== undefined) {
      if (!ObjectId.isValid(sanitized.courseId)) {
        errors.push("Invalid course ID format");
      } else {
        sanitized.courseId = new ObjectId(sanitized.courseId);
      }
    }

    // Title validation
    if (sanitized.title !== undefined) {
      if (typeof sanitized.title !== "string") {
        errors.push("Title must be a string");
      } else if (sanitized.title.length < 3 || sanitized.title.length > 200) {
        errors.push("Title must be between 3 and 200 characters");
      } else {
        sanitized.title = sanitized.title.trim();
      }
    }

    // Description validation
    if (sanitized.description !== undefined) {
      if (typeof sanitized.description !== "string") {
        errors.push("Description must be a string");
      } else if (sanitized.description.length > 500) {
        errors.push("Description must not exceed 500 characters");
      } else {
        sanitized.description = sanitized.description.trim();
      }
    }

    // Content validation
    if (sanitized.content !== undefined) {
      if (typeof sanitized.content !== "string") {
        errors.push("Content must be a string");
      } else if (sanitized.content.length > 50000) {
        errors.push("Content must not exceed 50,000 characters");
      }
    }

    // Order validation
    if (sanitized.order !== undefined) {
      const order = Number(sanitized.order);
      if (!Number.isInteger(order) || order < 1) {
        errors.push("Order must be a positive integer");
      } else {
        sanitized.order = order;
      }
    }

    // Media validation
    if (sanitized.media !== undefined) {
      const { media } = sanitized;
      if (typeof media !== "object" || media === null) {
        errors.push("Media must be an object");
      } else {
        const validMediaTypes = ["video", "audio", "image", "pdf"];
        if (media.type && !validMediaTypes.includes(media.type)) {
          errors.push(
            `Media type must be one of: ${validMediaTypes.join(", ")}`
          );
        }
        if (media.duration !== undefined) {
          const duration = Number(media.duration);
          if (!Number.isInteger(duration) || duration < 0) {
            errors.push("Media duration must be a non-negative integer");
          } else {
            sanitized.media.duration = duration;
          }
        }
      }
    }

    // Boolean field validation
    if (sanitized.isActive !== undefined) {
      sanitized.isActive = Boolean(sanitized.isActive);
    }

    // Add timestamps
    if (!isUpdate) {
      sanitized.createdAt = new Date();
    }
    sanitized.updatedAt = new Date();

    if (errors.length > 0) {
      throw new ValidationError(`Unit validation failed: ${errors.join(", ")}`);
    }

    return sanitized;
  }
}

/**
 * Question data validation and sanitization
 */
export class QuestionValidator {
  static validate(questionData, isUpdate = false) {
    const errors = [];
    const sanitized = { ...questionData };

    // Required field validation
    if (!isUpdate) {
      const required = ["unitId", "courseId", "type", "questionText", "order"];
      for (const field of required) {
        if (!sanitized[field]) {
          errors.push(`${field} is required`);
        }
      }
    }

    // UnitId and CourseId validation
    ["unitId", "courseId"].forEach((field) => {
      if (sanitized[field] !== undefined) {
        if (!ObjectId.isValid(sanitized[field])) {
          errors.push(`Invalid ${field} format`);
        } else {
          sanitized[field] = new ObjectId(sanitized[field]);
        }
      }
    });

    // Type validation
    const validTypes = ["MCQ", "FILL_BLANK", "TEXT", "AUDIO"];
    if (sanitized.type !== undefined) {
      if (!validTypes.includes(sanitized.type)) {
        errors.push(`Type must be one of: ${validTypes.join(", ")}`);
      }
    }

    // Question text validation
    if (sanitized.questionText !== undefined) {
      if (typeof sanitized.questionText !== "string") {
        errors.push("Question text must be a string");
      } else if (
        sanitized.questionText.length < 10 ||
        sanitized.questionText.length > 1000
      ) {
        errors.push("Question text must be between 10 and 1000 characters");
      } else {
        sanitized.questionText = sanitized.questionText.trim();
      }
    }

    // Explanation validation
    if (sanitized.explanation !== undefined) {
      if (typeof sanitized.explanation !== "string") {
        errors.push("Explanation must be a string");
      } else if (sanitized.explanation.length > 1000) {
        errors.push("Explanation must not exceed 1000 characters");
      } else {
        sanitized.explanation = sanitized.explanation.trim();
      }
    }

    // Points validation
    if (sanitized.points !== undefined) {
      const points = Number(sanitized.points);
      if (!Number.isInteger(points) || points < 1 || points > 100) {
        errors.push("Points must be an integer between 1 and 100");
      } else {
        sanitized.points = points;
      }
    }

    // Difficulty validation
    const validDifficulties = ["easy", "medium", "hard"];
    if (sanitized.difficulty !== undefined) {
      if (!validDifficulties.includes(sanitized.difficulty)) {
        errors.push(
          `Difficulty must be one of: ${validDifficulties.join(", ")}`
        );
      }
    }

    // Order validation
    if (sanitized.order !== undefined) {
      const order = Number(sanitized.order);
      if (!Number.isInteger(order) || order < 1) {
        errors.push("Order must be a positive integer");
      } else {
        sanitized.order = order;
      }
    }

    // Media validation
    if (sanitized.media !== undefined) {
      const { media } = sanitized;
      if (typeof media !== "object" || media === null) {
        errors.push("Media must be an object");
      } else {
        const validMediaTypes = ["image", "audio", "video"];
        if (media.type && !validMediaTypes.includes(media.type)) {
          errors.push(
            `Media type must be one of: ${validMediaTypes.join(", ")}`
          );
        }
      }
    }

    // Question data validation (type-specific)
    if (sanitized.questionData !== undefined) {
      try {
        QuestionValidator.validateQuestionData(
          sanitized.type,
          sanitized.questionData
        );
      } catch (error) {
        errors.push(error.message);
      }
    }

    // Boolean field validation
    if (sanitized.isActive !== undefined) {
      sanitized.isActive = Boolean(sanitized.isActive);
    }

    // Add timestamps
    if (!isUpdate) {
      sanitized.createdAt = new Date();
    }
    sanitized.updatedAt = new Date();

    if (errors.length > 0) {
      throw new ValidationError(
        `Question validation failed: ${errors.join(", ")}`
      );
    }

    return sanitized;
  }

  static validateQuestionData(type, questionData) {
    if (!questionData || typeof questionData !== "object") {
      throw new Error("Question data must be an object");
    }

    switch (type) {
      case "MCQ":
        if (
          !Array.isArray(questionData.options) ||
          questionData.options.length < 2
        ) {
          throw new Error("MCQ must have at least 2 options");
        }
        if (
          typeof questionData.correctAnswer !== "number" ||
          questionData.correctAnswer < 0 ||
          questionData.correctAnswer >= questionData.options.length
        ) {
          throw new Error("MCQ must have a valid correct answer index");
        }
        break;

      case "FILL_BLANK":
        if (
          !Array.isArray(questionData.correctAnswers) ||
          questionData.correctAnswers.length === 0
        ) {
          throw new Error(
            "Fill-in-blank must have at least one correct answer"
          );
        }
        break;

      case "TEXT":
        if (questionData.maxLength !== undefined) {
          const maxLength = Number(questionData.maxLength);
          if (!Number.isInteger(maxLength) || maxLength < 1) {
            throw new Error(
              "Text question max length must be a positive integer"
            );
          }
        }
        break;

      case "AUDIO":
        if (
          !questionData.audioUrl ||
          typeof questionData.audioUrl !== "string"
        ) {
          throw new Error("Audio question must have a valid audio URL");
        }
        break;

      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }
}

/**
 * Generic validation utilities
 */
export class ValidationUtils {
  /**
   * Validate ObjectId format
   */
  static validateObjectId(id, fieldName = "ID") {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, id);
    }
    return new ObjectId(id);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(value, fieldName, minLength = 0, maxLength = null) {
    if (typeof value !== "string") {
      throw new ValidationError(
        `${fieldName} must be a string`,
        fieldName,
        value
      );
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters`,
        fieldName,
        value
      );
    }

    if (maxLength && trimmed.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must not exceed ${maxLength} characters`,
        fieldName,
        value
      );
    }

    return trimmed;
  }

  /**
   * Validate enum value
   */
  static validateEnum(value, validValues, fieldName) {
    if (!validValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${validValues.join(", ")}`,
        fieldName,
        value
      );
    }
    return value;
  }

  /**
   * Validate and convert to integer
   */
  static validateInteger(value, fieldName, min = null, max = null) {
    const num = Number(value);

    if (!Number.isInteger(num)) {
      throw new ValidationError(
        `${fieldName} must be an integer`,
        fieldName,
        value
      );
    }

    if (min !== null && num < min) {
      throw new ValidationError(
        `${fieldName} must be at least ${min}`,
        fieldName,
        value
      );
    }

    if (max !== null && num > max) {
      throw new ValidationError(
        `${fieldName} must not exceed ${max}`,
        fieldName,
        value
      );
    }

    return num;
  }

  /**
   * Validate and convert to number
   */
  static validateNumber(value, fieldName, min = null, max = null) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new ValidationError(
        `${fieldName} must be a number`,
        fieldName,
        value
      );
    }

    if (min !== null && num < min) {
      throw new ValidationError(
        `${fieldName} must be at least ${min}`,
        fieldName,
        value
      );
    }

    if (max !== null && num > max) {
      throw new ValidationError(
        `${fieldName} must not exceed ${max}`,
        fieldName,
        value
      );
    }

    return num;
  }
}

export default {
  ValidationError,
  CourseValidator,
  UnitValidator,
  QuestionValidator,
  ValidationUtils,
};
