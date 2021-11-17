import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../../components/user/TopBar';
import styled from "styled-components";
import Calendar from '../../../components/user/Calendar';
import ReservationEquipTray from '../../../components/user/ReservationEquipTray';
import moment from 'moment';
import axios from "axios";

class DateSelection extends Component {
    constructor(props) {
        super(props);

        const currentDate = moment();
        this.state = {
            holidays: [],
            year: currentDate.format('YYYY'),
            month: currentDate.format('MM'),
            day: currentDate.format('DD'),
            isHoliday: false,
            isRezValidDay: true,
            rezValidDate: 0,
            buttonText: '',
            isRezValid: true,
            equipList: []
        }
    }

    componentDidMount() {
        //여기서 휴일 받아오기
        const holidays = this.getHolidays('http://localhost:8080/reservation/calRegularHolidayDate', this.state.year, this.state.month);
        holidays.concat(this.getHolidays('http://localhost:8080/reservation/calHolidayDate', this.state.year, this.state.month));

        const currentDate = moment();
        const isHoliday = holidays.includes(currentDate.format("YYYYMMDD"));

        this.getSelectDateEquipList(this.state.year, this.state.month, this.state.day);

        this.getRezValidDate();

        this.getHolidays(this.state.year, this.state.month);

        this.setState({
            isHoliday: isHoliday,
            buttonText: isHoliday ? '휴무일 입니다.' : this.state.year + ' ' + this.state.month + '/' + this.state.day + ' 예약하기',
            isRezValid: !isHoliday
        })
    }

    getHolidays(uri, year, month) {

        let holidays = [];
        axios.get(uri,
            {
                year: year,
                month: month
            },
            {
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then((response) => {
                holidays = response.data.data;
                console.log(response.data.data)
            })
            .catch((response) => {
                console.log('Error');
                console.log(response);
            });

        return holidays;
    }

    getRezValidDate() {
        axios.get('http://localhost:8080/reservation/calAvailableDate',
            {
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then((response) => {
                const rezValidDate = response.data.data.length;
                this.setState({ rezValidDate: rezValidDate })
            })
            .catch((response) => {
                console.log('Error');
                console.log(response);
            });
    }

    getSelectDateEquipList(year, month, day) {
        axios.post('http://localhost:8080/reservation/readMyReservationOfSelectedDay',
            {
                year: year,
                month: month,
                day: day,
                userID: window.sessionStorage.getItem('id')
            },
            {
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then((response) => {
                const equipList = response.data.data;
                this.setState({ equipList: equipList === null ? [] : equipList });
            })
            .catch((response) => {
                console.log('Error');
                console.log(response);
            });
    }

    selectDate = (data) => {

        console.log(data);
        this.setState({
            year: data.year,
            month: data.month,
            day: data.day,
            isHoliday: data.isHoliday,
            isRezValidDay: data.isRezValidDay
        }, () => {
            if (!this.state.isRezValidDay) {
                this.setState({ buttonText: '예약이 불가능한 날짜입니다.', isRezValid: false });
                return;
            }
            else if (this.state.isHoliday) {
                this.setState({ buttonText: '휴무일 입니다.', isRezValid: false })
            }
            else {
                this.setState({ buttonText: this.state.year + ' ' + this.state.month + '/' + this.state.day + ' 예약하기', isRezValid: true })
            }
        })
        //기구리스트 가져오기
        this.getSelectDateEquipList(data.year, data.month, data.day);

    }

    onClickReservationButton(e) {
        if (!this.state.isRezValidDay) {
            e.preventDefault();
            this.setState({ buttonText: '예약이 불가능한 날짜입니다.' });
            return;
        }

        if (this.state.isHoliday) {
            e.preventDefault();
            this.setState({ buttonText: '휴무일 입니다.' })
        }
    }

    render() {
        const rezValidDate = 4;
        return (
            <div>
                <TopBar>기구 예약 - 날짜 선택</TopBar>
                <br />
                {/* 
                [예약가능 날짜 면수] 
                rezValidDate 정수로 몇일인지 주면됨 ex) rezValidDate={4}
                
                [선택 날짜 가져오는 메소드]
                onClickDate 아래와 같은메소드를 통해 사용, 현재 컴포넌트의 state에 선택한 날짜를 가져오기 위함
                    selectDate = (data) => {
                    this.setState({
                        year: data.year,
                        month: data.month,
                        day: data.day
                    })
                }
                [현재 선택 날짜]
                onClickDate를 통해설정한 선택한 날짜를 보내줌 this.state 보내주면 됨

                [휴무일로 선택하고자 하는 날짜 리스트]
                holidays 에 배열로 설정후 넣어주기 ex)["20211106", "20211113", "20211120"]
                */}
                <Calendar onClickDate={this.selectDate} selectedDate={this.state}
                    rezValidDate={this.state.rezValidDate} holidays={this.state.holidays}></Calendar>
                <br />
                <ReservationEquipTray equipList={this.state.equipList}></ReservationEquipTray>
                <br />
                <StyledLink to={{
                    pathname: "/user/reservation/equip",
                    state: {
                        year: this.state.year,
                        month: this.state.month,
                        day: this.state.day,
                        equipList: this.state.equipList
                    }
                }} onClick={this.onClickReservationButton.bind(this)}>
                    <StyledButtonArea>
                        <StyledMenuText isValid={this.state.isRezValid}>
                            {this.state.buttonText}
                        </StyledMenuText>
                    </StyledButtonArea>
                </StyledLink>
            </div>
        );
    }
}

var StyledMenuText = styled.div`
    font-size:15px;
    display: inline-block;
    padding-left : 10px;
    margin-bottom:15px;
    margin-top:15px;
    color:${props => props.isValid ? 'white' : 'red'}
`;


var StyledButtonArea = styled.div`
    width:99%;
    max-width:500px;
    margin: 0 auto;
    padding-top:10px;
    padding-bottom:10px;
    margin-top:10px;
    background-color:#404040;
    color:white;
    border-radius:6px;
`

const StyledCalendarBoard = styled.div`
    position:relative;
    background-color:orange;
    margin: 0 auto;
    width:100%;
    max-width:800px;
    height:500px;
    max-height:900px;
    margin-top:20px;
    margin-bottom:20px;
`;

const StyledLink = styled(Link)`
    text-decoration:none;
    color:black;
`;

const StyledReservationButton = styled.button`

`;


export default DateSelection;