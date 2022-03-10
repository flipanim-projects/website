import React from 'react';
import { NavLink } from "react-router-dom";

class Navbar extends React.Component {
    state = {
        open: ''
    }
    showHideProfileOptions = () => {
        let cur = this.state.open
        if (!cur) this.setState({ open: 'open' })
        else this.setState({ open: '' })
    }
    render() {
        const { open } = this.state;
        return (
            <div>
                <nav>
                    <div className="flex">
                        <img alt="FlipAnim" className="nav-logo" src="../public/img/flipanimv2.png" height="35px" />
                        <NavLink to="/browse">Browse</NavLink>
                        <NavLink to="/follows">Follows</NavLink>
                    </div>
                    <div className="profile">
                        <img onClick={this.showHideProfileOptions.bind(this)} />
                    </div>
                </nav>
                <div className={`profile-options ${open}`}>
                    <p className='logged-in-as'>
                        Logged in as <span>@FlipAnim</span></p>
                    <div className="profile-option" id="profileLink">Profile</div>
                    <div className="profile-option">Settings</div>
                    <div className="profile-option" id="logOut">Log out</div>
                </div>
            </div>
        )
    }

}

export default Navbar