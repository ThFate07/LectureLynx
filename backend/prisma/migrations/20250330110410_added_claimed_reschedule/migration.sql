-- CreateTable
CREATE TABLE `classes` (
    `class_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,

    PRIMARY KEY (`class_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturereschedulerequests` (
    `request_id` INTEGER NOT NULL AUTO_INCREMENT,
    `timetable_id` INTEGER NOT NULL,
    `original_teacher_id` INTEGER NOT NULL,
    `requested_time` DATETIME(0) NOT NULL,
    `status` ENUM('Pending', 'Claimed', 'Rejected') NULL DEFAULT 'Pending',
    `reason` TEXT NULL,
    `claimed_by_teacher_id` INTEGER NULL,

    INDEX `teacher_id`(`original_teacher_id`),
    INDEX `timetable_id`(`timetable_id`),
    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `department` VARCHAR(50) NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable` (
    `timetable_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `start_time` TIME(0) NOT NULL,
    `end_time` TIME(0) NOT NULL,
    `status` ENUM('Scheduled', 'Reschedule Requested', 'Cancelled') NULL DEFAULT 'Scheduled',

    INDEX `class_id`(`class_id`),
    INDEX `subject_id`(`subject_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`timetable_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lecturereschedulerequests` ADD CONSTRAINT `lecturereschedulerequests_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `timetable`(`timetable_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lecturereschedulerequests` ADD CONSTRAINT `lecturereschedulerequests_ibfk_2` FOREIGN KEY (`original_teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lecturereschedulerequests` ADD CONSTRAINT `lecturereschedulerequests_claimed_by_teacher_id_fkey` FOREIGN KEY (`claimed_by_teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `timetable` ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `timetable` ADD CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `timetable` ADD CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
