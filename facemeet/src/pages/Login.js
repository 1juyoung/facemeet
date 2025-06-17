import React, { useState } from 'react';
import background from '../login_background.png'; // 배경 이미지를 가져옵니다.
import logo from '../Logo.png'; // 로고 이미지를 가져옵니다.
import './Login.css'; // 스타일을 가져옵니다.
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅을 가져옵니다.


function Login() {
  const navigate = useNavigate(); // 페이지 이동 함수를 초기화합니다.
  const [userId, setUserId] = useState(''); // 이메일 입력을 위한 상태를 설정합니다.
  const [password, setPassword] = useState(''); // 비밀번호 입력을 위한 상태를 설정합니다.
  const [rememberMe, setRememberMe] = useState(false);
  // 로그인 시도를 처리하는 함수입니다.
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // 서버에 로그인 요청 보내기
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password, rememberMe }),
      });


      if (response.ok) {
        // 로그인 성공 시 서버로부터의 응답을 처리
        const data = await response.json();
        const token = data.token;

        localStorage.setItem('token', token);
        localStorage.setItem('userId', data.userId);

        window.location.href = "/Home";
      } else {
        // 로그인 실패시
        alert("올바른 아이디와 비밀번호를 입력하세요.");

        console.error("로그인 실패", response.statusText);
      }
    } catch (error) {
      console.error("오류 발생", error);
    }
  };


  // 회원가입 버튼 클릭을 처리하는 함수입니다.
  const handleJoinClick = () => {
    navigate('/join'); // 회원가입 페이지로 이동합니다.
  };


  return (
    <form onSubmit={handleLogin} className="Before" style={{ position: 'flex' }}> {/* 메인 컨테이너 */}
      <img src={background} alt="로그인 배경 이미지" style={{ height: "46.3rem", width: "100%", overflowY: "hidden", }} /> {/* 배경 이미지 */}

      <box> {/* 로그인 폼을 위한 컨테이너 */}
        <logo><img src={logo} alt="로고"></img></logo> {/* 로고 */}
        <box2> {/* 이메일 입력을 위한 컨테이너 */}
          <input

            type="text"
            name="userId"

            placeholder="Email"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
          </input>
        </box2>
        <box3> {/* 비밀번호 입력을 위한 컨테이너 */}
          <input
            type="password"

            name="password"

            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}>
          </input>
        </box3>

        <button id="idButton" style={{ color: '#7C7C7C', fontSize: '0.8rem' }} onClick={handleLogin}>로그인</button> {/* 로그인 버튼 */}

        <text1>______________  또는  ______________</text1> {/* 또는 구분선 */}

        <button id="kakaoButton" style={{ color: '#7C7C7C' }}>카카오톡으로 로그인</button> {/* 카카오톡으로 로그인 버튼 */}
        <label htmlFor="rememberMe">Remember me:</label>
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />

        {/**/}  <span onClick={handleJoinClick}>회원가입</span>
        <span onClick={handleLogin}>아이디 찾기</span>
        <span onClick={handleLogin}>비밀번호 찾기</span>
      </box>
    </form>
  );
}

export default Login;
