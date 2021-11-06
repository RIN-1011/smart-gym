import React, { Component } from "react";
import UserApprovalItem from "./uAItem";
import axios from "axios";
import $ from "jquery";
import jquery from 'jquery';
class UserApprovalListpage extends Component {
    id = 1;
    state = {};
    render() {
        const { Itemcard } = this.props;
        console.log(Itemcard);
        return (
            <ul className="list__itemview">
                {Itemcard &&
                    Itemcard.map((itemdata, insertIndex) => {
                        return (
                            <UserApprovalItem
                                key={insertIndex}
                                UserApprovalId={itemdata.userID}
                                UserApprovalName={itemdata.userName}
                            />
                        );
                    })}
            </ul>
        );
    }
}
export default UserApprovalListpage;