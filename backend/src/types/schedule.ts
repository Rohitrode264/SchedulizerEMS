import { CourseType } from '@prisma/client';

export interface ScheduleEntry {
  day: number;
  startSlot: number;
  duration: number;
  facultyName: string;
  courseName: string;
  courseType: CourseType;
  batches: string[]; 
}

export interface ScheduleResponse {
  days: number;
  slots: number;
  studentGroupId: ScheduleEntry[];
}