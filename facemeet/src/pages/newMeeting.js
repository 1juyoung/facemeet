import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const NewMeeting = () => {
    const socket = io("http://localhost:4000");

    useEffect(() => {
        socket.on("connect", () => {
            socket.emit("event1", "hello kw!");
        });

        socket.on("getID", (data) => {
            const myIdElement = document.getElementById("myid");
            const newParagraph = document.createElement("p");
            newParagraph.textContent = `MY ID: ${data}`;
            myIdElement.appendChild(newParagraph);
        });

        socket.on("msg", (data) => {
            let log = document.getElementById("msg");
            let ptag = document.createElement("p");
            ptag.textContent = `${data.id} 에서 보낸 메세지 : ${data.message}`;
            log.appendChild(ptag);
        });

        return () => {
            socket.off("connect");
            socket.off("getID");
            socket.off("msg");
        };
    }, []);

    const input = (event) => {
        event.preventDefault();
        let data = document.getElementById("input_msg").value;
        socket.emit("input", data);
    };

    const inputWM = (event) => {
        event.preventDefault();
        let data = document.getElementById("input_msg").value;
        socket.emit("inputWM", data);
    };

    const privatemsg = (event) => {
        event.preventDefault();
        let data = document.getElementById("input_msg").value;
        let id = document.getElementById("input_id").value;
        socket.emit("private", id, data);
    };

    return (
        <div className="container fluid">
            <div className="row">
                <div className="col-3"> </div>
                <div className="col-6">
                    <div id="myid"><br /><p></p></div>
                    <div id="msg"></div>
                    <form action="#">
                        <input type="text"
                            className="form-control mb-3"
                            id="input_msg"
                            placeholder='보낼메세지'
                            autoComplete='off' />
                        <input type="text"
                            className="form-control mb-3"
                            id="input_id"
                            placeholder='수신 id'
                            autoComplete='off' />
                        <button onClick={input}>
                            모두에게
                        </button>
                        <button onClick={inputWM}>
                            나빼고
                        </button>
                        <button onClick={privatemsg}>
                            특정사용자
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewMeeting;
