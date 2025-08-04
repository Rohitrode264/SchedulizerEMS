import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import Button from "../Inputs/Button";
import Timetable from "../TimeTable";
import axios from "axios";
import config from '../../../config.json';

function StudentGroupMenu() {
  const { scheduleId, studentGroupId } = useParams();
  const [show, setShow] = useState<
    'regularTheory' | 'regularPractical' | 'availability' | 'programPractical' | 'programTheory'
  >('regularTheory');

  const [timetableData, setTimetableData] = useState<null | {
    days: string[];
    slots: string[];
    entries: {
      [day: string]: {
        [slot: string]: string;
      };
    };
  }>(null);

  const [showTimetable, setShowTimetable] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    navigate(show);
  }, [show]);

  return (
    <>
      <div className="flex justify-between items-center mb-5 w-full flex-wrap gap-4">
        <div className='flex bg-background-secondary w-fit rounded-md cursor-pointer text-white'>
          {[
            ['regularTheory', 'Regular Theory'],
            ['regularPractical', 'Regular Practical'],
            ['programTheory', 'Program Elective Theory'],
            ['programPractical', 'Program Elective Practical'],
            ['availability', 'Availability'],
          ].map(([key, label]) => (
            <div
              key={key}
              className={`py-1 px-3 border-2 border-primary-purple/75 ${
                show === key ? 'bg-primary-purple/75' : 'bg-transparent'
              } ${key === 'regularTheory' ? 'rounded-md rounded-r-none' : ''}
                 ${key === 'availability' ? 'rounded-md rounded-l-none' : ''}
                 ${key !== 'regularTheory' ? 'border-l-0' : ''}`}
              onClick={() => setShow(key as typeof show)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <Button
        handler={() => {
			
			navigate(`/timetable/${scheduleId}/${studentGroupId}`);
	}} 
        className="rounded-lg hover:bg-white hover:text-black hover:duration-300 mb-4"
      >
        View Timetable
      </Button>

      

      <Outlet />
    </>
  );
}

export default StudentGroupMenu;
