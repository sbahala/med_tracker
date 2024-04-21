import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../pages/Home';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home Component Tests', () => {
  const setup = () => {
    const utils = render(
      <Router>
        <Home />
      </Router>
    );
    const loginButton = utils.getByText('Login');
    const signUpButton = utils.getByText('Sign Up');
    return {
      loginButton,
      signUpButton,
      ...utils,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the login page on login button click', () => {
    const { loginButton } = setup();
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to the signup page on sign up button click', () => {
    const { signUpButton } = setup();
    fireEvent.click(signUpButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
