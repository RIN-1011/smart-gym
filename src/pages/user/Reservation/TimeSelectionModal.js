import React, { Component } from 'react';
import Modal from '../../../components/user/Modal';
import styled from 'styled-components';
import TimeTable from '../../../components/user/TimeTable';
import InputButton from '../../../components/user/InputButton';
import axios from "axios";


class TimeSelectionModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            //timeTable에서 선택하여 조회한 시간
            selectedStartTime: '',
            selectedEndTime: '',
            selectedBarColor: 'grey',

            //예약하고자하는 시간
            startTimeHour: '0',
            startTimeMinute: '0',
            exerciseMinute: '10',

            //영업시간
            openTime: '06:00',
            closeTime: '2:00',

            //예약가능시간 체크
            isValid: false,
            guideMessage: ' ',

            reservationTimeList: []
        }
    }

    componentDidMount() {
    }

    static getDerivedStateFromProps(nextProps, prevState) {

    }

    getSelectedBarTime(data) {
        this.setState({
            selectedStartTime: data.time.startTime,
            selectedEndTime: data.time.endTime,
            selectedBarColor: data.color
        })
    }

    handleSubmit(e) {
        e.preventDefault();

        //서버에 요청보내기
        const date = this.props.date;
        const dateFormat = date.year + '-' + date.month + '-' + date.day + 'T';
        let endTimeHour = parseInt(this.state.startTimeHour);
        let endTimeMinute = parseInt(this.state.startTimeMinute);

        endTimeMinute += parseInt(this.state.exerciseMinute);
        if (endTimeMinute >= 60) {
            endTimeMinute -= 60;
            endTimeHour += 1;
        }

        console.log(dateFormat + this.getTimeFormat(this.state.startTimeHour, this.state.startTimeMinute))
        console.log(dateFormat + this.getTimeFormat(endTimeHour, endTimeMinute))

        axios.post("http://localhost:8080/reservation/makeReservation",
            {
                userID: window.sessionStorage.getItem('id'),
                equipmentID: this.props.equipmentID,
                startTime: dateFormat + this.getTimeFormat(this.state.startTimeHour, this.state.startTimeMinute),
                endTime: dateFormat + this.getTimeFormat(endTimeHour, endTimeMinute)
            },
            {
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then((response) => {
                const reservationTimeList = response.data.data;
                if (response.data.success) {
                    this.setState({ reservationTimeList: reservationTimeList })
                    window.location.reload();
                }
            })
            .catch((response) => {
                console.log('Error');
                console.log(response);
            })
    }

    getTimeFormat(hour, minute) {
        return this.fillterTimeZero(hour) + ':' + this.fillterTimeZero(minute) + ':00';
    }

    fillterTimeZero(number) {
        return number / 10 < 1 ? '0' + number : number;
    }

    checkOverlap() {

        let start = this.state.startTimeHour + ":" + this.state.startTimeMinute;
        console.log(start)
        let exercieMinute = this.state.exerciseMinute;
        let startTime = this.changeTimeNumber(start);
        let endTime = startTime + exercieMinute / 60;

        for (let index = 0; index < this.state.reservationTimeList.length; index++) {
            let time = this.state.reservationTimeList[index];

            let reservedStartTime = this.changeTimeNumber(time.startTime);
            let reservedEndTime = this.changeTimeNumber(time.endTime);


            //겹치는 시간 발생
            console.log(startTime);
            console.log(endTime);

            if (endTime > reservedStartTime && startTime < reservedEndTime) {
                console.log("asdf")

                this.setState({
                    //예약가능시간 체크
                    isValid: false,
                    guideMessage: '다른 사용자가 이미 예약한 시간입니다.'
                })

                return;
            }
        }
        this.setState({
            //예약가능시간 체크
            isValid: true,
            guideMessage: '예약 가능한 시간입니다.'
        });
    }


    changeTimeNumber(time) {
        let timeArr = time.split(':');
        return parseInt(timeArr[0]) + parseInt(timeArr[1]) / 60
    }



    handleChange(e, propertyName) {
        this.setState({ [propertyName]: e.target.value }, () => {
            this.checkOverlap();
        });
    }

    render() {
        let startHour = Array.from({ length: 24 }, (v, i) => i);
        let startHourOptions = startHour.map((value, index) => {
            return <OptionStyle value={value} key={'hour-' + value}>{value}</OptionStyle>
        })

        let StartMinute = Array.from({ length: 12 }, (v, i) => i * 5);
        let StartMinuteOptions = StartMinute.map((value, index) => {
            return <OptionStyle value={value} key={'minute-' + value} > {value}</OptionStyle >
        })

        let exerciseMinute = Array.from({ length: 7 }, (v, i) => i * 5 + 10);
        let exerciseMinuteOptions = exerciseMinute.map((value, index) => {
            return <OptionStyle value={value} key={'exercise-time-' + value} > {value}</OptionStyle >
        })


        return (
            <Modal onClick={this.props.closeModal} >
                <DateStyle>
                    {this.props.date.month + "월 " + this.props.date.day + "일 "}
                </DateStyle>
                <EquipNameStyle>
                    {this.props.children}
                </EquipNameStyle>
                <TimeTable selectTime={this.getSelectedBarTime.bind(this)}
                    reservationTimeList={this.state.reservationTimeList}
                    selectedData={{
                        year: this.props.date.year,
                        month: this.props.date.month,
                        day: this.props.date.day,
                        equipmentID: this.props.equipmentID,
                    }}></TimeTable>
                <MessageStyle barColor={this.state.selectedBarColor}>
                    {this.state.selectedStartTime} -  {this.state.selectedEndTime}
                </MessageStyle>
                <form onSubmit={this.handleSubmit.bind(this)} autoComplete={"off"}>
                    <ReservationTimeStyle>
                        <SelectStyle name="시" id="startHour" value={this.state.startTimeHour}
                            onChange={(e) => this.handleChange(e, 'startTimeHour')} size={1}>
                            {startHourOptions}
                        </SelectStyle>
                        시
                        <SelectStyle name="분" id="startMinute" value={this.state.startTimeMinute}
                            onChange={(e) => this.handleChange(e, 'startTimeMinute')}>
                            {StartMinuteOptions}
                        </SelectStyle>
                        분 부터
                        <SelectStyle name="분" id="minute" value={this.state.exerciseMinute}
                            onChange={(e) => this.handleChange(e, 'exerciseMinute')}>
                            {exerciseMinuteOptions}
                        </SelectStyle>
                        분 운동
                    </ReservationTimeStyle>
                    {this.state.isValid ? <ValidMessageStyle>{this.state.guideMessage} </ValidMessageStyle> : <ErrorMessageStyle>{this.state.guideMessage}</ErrorMessageStyle>}
                    <InputButton type='submit' value='예약'></InputButton>
                </form>
            </Modal>
        );
    }
}

var MessageStyle = styled.div`
    margin:0 auto;
    text-align:center;
    width:200px;
    font-size:20px;
    border-radius:4px;
    background-color: ${props => props.barColor};
    color:white;
    margin-top:20px;
    margin-bottom:20px;
`;

var SelectStyle = styled.select`
    border: 0px solid #999;
    background: url('arrow.jpg') no-repeat 95% 50%;
    font-size:40px;

    list-style:none;
white-space:nowrap;
    background-color:rgba(255,255,255,0);
    ::-webkit-scrollbar{
        display:none;
    }
`;
var OptionStyle = styled.option`
    font-size:20px;

`;

let ReservationTimeStyle = styled.div`
text-align:left;
height: 60px;
width: 100%;
border:none;
`;

let ValidMessageStyle = styled.div`
    padding:10px;
    color:green;
    font-size:16px;
    margin: 0 auto;
    width:100%;
`;

let ErrorMessageStyle = styled.div`
    padding:10px;
    
    color:red;
    font-size:16px;
    margin: 0 auto;
    width:100%;
`;

let DateStyle = styled.div`
    display:inline-block;
    font-size:16px;
    padding:0 10px 30px 0;
`;
let EquipNameStyle = styled.div`
    display:inline-block;
    font-size:24px;
    padding:0 0 30px 0;

`;

export default TimeSelectionModal;