import React, { useEffect, useState } from "react";
import PageWrapper from "../components/Wrappers/PageWrapper";
import axios from "axios";
import config from '../../config.json';
import { useParams } from "react-router-dom";

type RawEntry = {
  day: number;
  startSlot: number;
  duration: number;
  facultyName: string;
  courseName: string;
};

type TimetableData = {
  days: number;
  slots: number;
  studentGroupId: RawEntry[];
};

type ProcessedTimetable = {
  days: string[];
  slots: string[];
  entries: {
    [day: string]: {
      [slot: string]: string;
    };
  };
};

const Timetable = () => {
  const { scheduleId, studentGroupId } = useParams();
  const [data, setData] = useState<ProcessedTimetable | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<TimetableData>(
          `${config.BACKEND_URl}/algorithmInput/studentGroup/${studentGroupId}/schedule/${scheduleId}`,
          { headers: { 'Authorization': token } }
        );
        const raw = response.data;
        const days = Array.from({ length: raw.days }, (_, i) => `Day ${i + 1}`);
        const slots = Array.from({ length: raw.slots }, (_, i) => `Slot ${i + 1}`);
        const entries: ProcessedTimetable['entries'] = {};
        days.forEach(day => { entries[day] = {}; });
        raw.studentGroupId.forEach(entry => {
          const dayKey = `Day ${entry.day + 1}`;
          for (let i = 0; i < entry.duration; i++) {
            const slotKey = `Slot ${entry.startSlot + i + 1}`;
            entries[dayKey][slotKey] = `${entry.courseName} - ${entry.facultyName}`;
          }
        });
        setData({ days, slots, entries });
      } catch {
        console.error("Error loading timetable");
      }
    };
    if (scheduleId && studentGroupId) fetchData();
  }, [scheduleId, studentGroupId]);

  if (!data) return <PageWrapper>Loading...</PageWrapper>;

  return (
    <PageWrapper>
      <div className="overflow-x-auto p-4 text-white bg-[#1a1a1a] min-h-screen">
        <table className="table-fixed border-collapse w-full text-sm text-center">
          <thead>
            <tr>
              <th className="border border-gray-900 bg-[#333333] text-white p-2">Day / Slot</th>
              {data.slots.map((slot, i) => (
                <th key={i} className="border border-gray-900 bg-[#333333] text-white p-2">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.days.map((day, i) => {
              const dayEntry = data.entries[day];
              return (
                <tr key={i}>
                  <td className="border border-gray-900 bg-[#333333] font-medium p-2">{day}</td>
                  {(() => {
                    const row: JSX.Element[] = [];
                    const used = new Set<number>();
                    for (let si = 0; si < data.slots.length; si++) {
                      const label = `Slot ${si + 1}`;
                      if (used.has(si)) continue;
                      const entry = dayEntry[label];
                      if (!entry) {
                        row.push(
                          <td key={si} className="border border-gray-900 p-2 bg-[#222222] text-white" />
                        );
                        continue;
                      }
                      let span = 1;
                      for (let d = 1; si + d < data.slots.length; d++) {
                        if (dayEntry[`Slot ${si + d + 1}`] === entry) {
                          span++;
                          used.add(si + d);
                        } else break;
                      }
                      row.push(
                        <td
                          key={si}
                          colSpan={span}
                          className="border border-gray-900 p-2 bg-[#4c4c4c] text-white font-medium text-sm"
                        >
                          {entry}
                        </td>
                      );
                    }
                    return row;
                  })()}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
};

export default Timetable;
