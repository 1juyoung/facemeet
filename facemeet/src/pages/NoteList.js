import React from 'react';
import Layout from '../components/Layout';
import '../components/Style.css';

function NoteList() {
  // 데이터 전달 해야됨
  return (
    <Layout>
      <div className='NoteList'>
        <div className='header'></div>
        <div className='cate'>
          <p className='item'>날짜</p>
          <p className='item'>시간</p>
          <p className='item'>이름</p>
          <p className='item'>분위기점수</p>
          <p className='item'>다시보기</p>
        </div>
        <div className='pagination'>
          <div className='arrow'>←</div> {/* Left arrow for previous page */}
          <div className='pages'>
            <div className='page-number'>1</div>
            <div className='page-number'>2</div>
            {/* Add more page numbers as needed */}
          </div>
          <div className='arrow'>→</div> {/* Right arrow for next page */}
        </div>
      </div>
    </Layout>
  );
}

export default NoteList;