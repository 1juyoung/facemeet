import React, { Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';


const Home = lazy(() => import('./pages/MeetingBefore'));
const Login = lazy(() => import('./pages/Login'));
const Join = lazy(() => import('./pages/Join'));
const MeetingDetail = lazy(() => import('./pages/MeetingDetail'));
const NoteList = lazy(() => import('./pages/NoteList'));
const Profile = lazy(() => import('./pages/Profile'));
const Friend = lazy(() => import('./pages/Friend'));
const NoteDetail = lazy(() => import('./pages/NoteDetail'));
const VideoTest = lazy(() => import('./pages/newMeeting'))
const ReHome = lazy(() => import('./pages/Home'));

function App() {

  return (
    <Suspense fallback={<Home />}>

      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/Join' element={<Join />} />
        <Route path='/NoteList' element={<NoteList />} /> {/* db 연동 할 땐 NoteList/:_id로 변경해야함*/}
        <Route path='/Profile' element={<Profile />} /> {/* db 연동 할 땐 NoteList/:_id로 변경해야함*/}
        <Route path='/Friend' element={<Friend />} /> {/* db 연동 할 땐 /:_id로 변경해야함*/}
        <Route path='/meetingdetail/:meetingId' element={<MeetingDetail />} /> {/* db 연동 할 땐 MeetingDetail/:_id로 변경해야함*/}
        <Route path='/NoteDetail' element={<NoteDetail />} />{/* db 연동 할 땐 NoteDetail/:_id로 변경해야함*/}
        <Route path='/newmeeting' element={<VideoTest />} />{/*video Test*/}

        {/*develop*/}
        <Route path='/reHome' element={<ReHome />} />{/*video Test*/}
      </Routes>

    </Suspense>
  );
}

export default App;

