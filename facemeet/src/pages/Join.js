
import React, { useState } from 'react';
import background from '../login_background.png'; // 배경 이미지를 가져옵니다.
import logo from '../Logo.png'; // 로고 이미지를 가져옵니다.
import './Login.css'; // 스타일을 가져옵니다.

class RegistrationForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSubmitEnabled: false,
            userId: '',
            pw1: '',
            pw2: '',
            pwMatch: '',
        };
    }

    checkDuplicate = async () => {
        const { userId } = this.state;

        if (!userId) {
            alert('ID를 입력하세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/register/checkDuplicate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();

            if (!result.isDuplicate) {
                alert('사용 가능한 ID입니다.');
                this.setState({ isSubmitEnabled: true });
                this.updateSubmitButton();
            } else {
                alert('중복된 ID입니다.');
                this.setState({ isSubmitEnabled: false });
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    updateSubmitButton = () => {
        const { userId, pw1, pw2 } = this.state;
        const pwMatch = '';

        const isUpdateSubmitEnabled =
            this.state.isSubmitEnabled &&
            userId &&
            pw1.length >= 4 &&
            /^(?=.*[A-Za-z])(?=.*\d)/.test(pw1) &&
            pw1 === pw2;

        if (pw1.length === 0) {
            this.setState({ pwMatch: '' });
        }

        if (pw1.length > 0 && !(pw1.length >= 4 && /^(?=.*[A-Za-z])(?=.*\d)/.test(pw1))) {
            this.setState({
                pwMatch: '비밀번호는 영어와 숫자 조합으로 4글자 이상이어야 합니다.',
            });
        } else {
            this.setState({ pwMatch: '' });

            if (pw1 !== pw2) {
                this.setState({ pwMatch: '비밀번호 1과 비밀번호 2가 일치하지 않습니다.' });
            }
        }

        this.setState({ pwMatch });
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = !isUpdateSubmitEnabled;
    };

    handleInputChange = (event) => {
        const { id, value } = event.target;
        this.setState({ [id]: value }, this.updateSubmitButton);
    };

    registerUser = async () => {
        const { userId, pw1, pw2 } = this.state;

        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, pw1, pw2 }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    render() {
        return (
            <div>
                <img src={background} alt="로그인 배경 이미지" style={{ height: "46.3rem", width: "100%", overflowY: "hidden", }} /> {/* 배경 이미지 */}
                <box>
                    <logo><img src={logo} alt="로고"></img></logo> {/* 로고 */}
                    <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <label htmlFor="userId">ID:</label>
                        <input type="text" id="userId" name="userId2" onChange={this.handleInputChange} required />
                        <button type="button" onClick={this.checkDuplicate}>
                            중복 확인
                        </button>
                        <br />
                        <label htmlFor="pw1">비밀번호1:</label>
                        <input
                            type="password"
                            id="pw1"
                            name="pw1"
                            minLength="4"
                            onChange={this.handleInputChange}
                            required
                        />
                        <br />
                        <label htmlFor="pw2">비밀번호2:</label>
                        <input
                            type="password"
                            id="pw2"
                            name="pw2"
                            minLength="4"
                            onChange={this.handleInputChange}
                            required
                        />
                        <br />
                        <span>{this.state.pwMatch}</span>
                        <br />
                        <button
                            type="button" id="submitBtn" disabled={!this.state.isSubmitEnabled} onClick={this.registerUser}
                            style={{ color: '#7C7C7C', fontSize: '0.8rem' }} >
                            회원가입
                        </button>
                    </form>
                </box >
            </div>
        );
    }
}

export default RegistrationForm;