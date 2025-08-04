import { CourseType } from '@prisma/client';

interface ScheduleEntry {
  day: number;
  startSlot: number;
  duration: number;
  courseName: string;
  courseType: CourseType;
  facultyName?: string;
}

interface ParsedScheduleData {
  studentGroups: Map<string, {
    classes: ScheduleEntry[];
    faculty: ScheduleEntry[];
  }>;
}

export function parseScheduleResult(result: any): ParsedScheduleData {
  console.log("Starting to parse schedule result");
  
  if (!result || typeof result !== 'object') {
    console.error("Invalid result object:", result);
    throw new Error("Invalid schedule result");
  }

  const parsed: ParsedScheduleData = {
    studentGroups: new Map()
  };

  if (!result.studentsGroupData) {
    console.error("Missing studentsGroupData");
    return parsed;
  }

  // Parse student group data
  Object.entries(result.studentsGroupData).forEach(([groupId, entries]: [string, any]) => {
    console.log(`Parsing student group ${groupId} with ${entries?.length || 0} entries`);
    
    if (!parsed.studentGroups.has(groupId)) {
      parsed.studentGroups.set(groupId, {
        classes: [],
        faculty: []
      });
    }

    if (Array.isArray(entries)) {
      entries.forEach(entry => {
        if (entry && typeof entry.day === 'number') {
          parsed.studentGroups.get(groupId)?.classes.push({
            day: entry.day,
            startSlot: entry.startSlot,
            duration: entry.duration || 1,
            courseName: entry.courseName,
            courseType: entry.courseType
          });
        }
      });
    }
  });

  // Parse faculty data
  if (result.facultyData) {
    Object.entries(result.facultyData).forEach(([groupId, entries]: [string, any]) => {
      console.log(`Parsing faculty data for group ${groupId} with ${entries?.length || 0} entries`);
      
      if (!parsed.studentGroups.has(groupId)) {
        return;
      }

      if (Array.isArray(entries)) {
        entries.forEach(entry => {
          if (entry && typeof entry.day === 'number') {
            parsed.studentGroups.get(groupId)?.faculty.push({
              day: entry.day,
              startSlot: entry.startSlot,
              duration: entry.duration || 1,
              courseName: entry.courseName,
              courseType: entry.courseType,
              facultyName: entry.facultyName
            });
          }
        });
      }
    });
  }

  console.log("Parsing completed");
  return parsed;
}