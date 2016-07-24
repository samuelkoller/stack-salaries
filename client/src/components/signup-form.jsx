import React from 'react';
import $ from 'jquery';
import { History } from 'react-router';
import { Router } from 'react-router';
import SignupInput from './signup-input';


class SignForm extends React.Component{
  constructor() {

    super();

    this.state = {
      name: "",
      password: "",
      email: "",
      gender: "",
      authToken: ""
    };
  }

  addUser(e) {
    this.setState({
      name: e.target.value
    });
  }

  addPassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  addEmail(e) {
    this.setState({
      email: e.target.value
    });
  }

  addGender(e){
    this.setState({
      gender: e.target.value
    })
  }

 redirectToDashboard(dataToken){
    this.props.history.pushState({token: dataToken}, '/dashboard');
  }


  SignUpToServer(e) {
    e.preventDefault();
    var self = this;

    var data = {name: this.state.name, email: this.state.email, password: this.state.password, gender: this.state.gender};

    console.log(data);
    $.ajax({
      url:"http://localhost:3000/signup",
      type:"POST",
      contentType:"application/json",
      data: JSON.stringify(data),
      success: function(data) {
        // console.log(data.token);
        localStorage.setItem('token', data.token),
        self.setState({
          authToken: data.token
        });
        self.redirectToDashboard(data.token);
      },
      error: function(err) {
        console.log(err);
      }
    });
  }

  render() {
    return (
      <div>
        <SignupInput SignUpToServer={this.SignUpToServer.bind(this)} addUser={this.addUser.bind(this)} addEmail={this.addEmail.bind(this)} addPassword={this.addPassword.bind(this)} />
      </div>
    );
  }
}

export default SignForm;