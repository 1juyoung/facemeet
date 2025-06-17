import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import '../components/Friend.css';
import { Box } from '@mui/material';

function Friend() {
  const [friendList, setFriendList] = useState([]);

  useEffect(() => {
    axios.get('/testData.json')
      .then(response => {
        const data = response.data.Profile;
        setFriendList(data);
      })
      .catch(error => {
        console.error('데이터를 불러오는 중 에러 발생:', error);
      });
  }, []);

  // friendList가 존재하고 첫 번째 친구 데이터만을 가져옴
  const firstFriend = friendList.length > 0 ? friendList[0] : null;

  return (
    <Layout>
      <div className="Friend box">
        {firstFriend && ( // firstFriend가 존재할 때만 렌더링
          <div>
            <h1>
              <h2>
                <p1>{firstFriend.name}</p1>
              </h2>
              <h3></h3>
              <h4>
                <p2>닉네임</p2>
                <input type="text" className="text-input" placeholder={firstFriend.name}></input>
                <p3>메모</p3>
                <textarea rows="5" cols="30" className="text-area"></textarea>
              </h4>
            </h1>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Friend;