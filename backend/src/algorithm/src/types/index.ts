export type CourseType = 'THEORY' | 'PRACTICAL';

export type _Class = {
    id: string
    facultyId: string
    facultyName: string
    studentGroupId: string
    roomId: string
    studentGroupName: string
    courseId: string
    courseType: CourseType
    scheduleId: string
    electiveBasketId: string | null
    batches: {id: string, name: string}[]
    concurrentClasses: string[] 
    concurrentByClasses: {id: string}[]
    courseCredits: number
    courseName: string
    headCount: number
    duration: number
    classesPerWeek: number
    preferredRoomId?: string
}

export type Room = {
    id: string,
    capacity: number,
    isLab: boolean,
    index? : number,
    code: string
}

export type ScheduleType = Array<Array<Array<Array<_Class>>>>;
