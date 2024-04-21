import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../pages/login';
import { signInWithEmailAndPassword } from 'firebase/auth';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  return {
    ...originalModule,
    signInWithEmailAndPassword: jest.fn((auth, email, password) => {
        switch (email) {
            case 'admin@example.com':
              return Promise.resolve({ user: { uid: 'admin123' } });
            case 'doctor@example.com':
              return Promise.resolve({ user: { uid: 'doctor134' } });
            case 'nurse@example.com':
              return Promise.resolve({ user: { uid: 'nurse135' } });
            case 'patient@example.com':
              return Promise.resolve({ user: { uid: 'patient123' } });
            default:
              return Promise.reject(new Error('Invalid credentials'));
          }
    }),
  };
});

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn((db, collection, userId) => ({ id: userId })),
  getDoc: jest.fn(docRef => {
    switch (docRef.id) {
      case 'admin123':
        return Promise.resolve({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ role: 'admin' }),
        });
      case 'doctor134':
        return Promise.resolve({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ role: 'doctor' }),
        });
      case 'nurse135':
        return Promise.resolve({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ role: 'nurse' }),
        });
      case 'patient123':
        return Promise.resolve({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({ role: 'patient' }),
        });
      default:
        return Promise.reject(new Error('No document'));
    }
  }),
}));

beforeEach(() => {
  console.error = jest.fn();
  jest.clearAllMocks();
  mockNavigate.mockReset();
  jest.resetAllMocks();
});

  const setup = () => {
    const utils = render(
      <Router>
        <Login />
      </Router>
    );
    const emailInput = utils.getByPlaceholderText('Email');
    const passwordInput = utils.getByPlaceholderText('Password');
    const submitButton = utils.getByRole('button', { name: /login/i });
    return {
      ...utils,
      emailInput,
      passwordInput,
      submitButton
    };
  };

  const performLogin = async (email, password) => {
    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.click(submitButton);
  };
  const expectErrorMessage = async (error) => {
    await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument());
  };
  
describe('Login functionality', () => {

  it.each`
  scenario                        | email               | password         | errorMessage
  ${'Failed login'}               | ${'user@example.com'} | ${'wrongpassword'} | ${'Something went wrong'}
  ${'Invalid login credentials'}  | ${'user@example.com'} | ${'wrongpassword'} | ${'Something went wrong'}
`('$scenario', async ({ email, password, errorMessage }) => {
  signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));
  await performLogin(email, password);
  await expectErrorMessage(errorMessage);
});

  it('displays an error message on failed login', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Failed to log in'));
    await performLogin('user@example.com', 'wrongpassword');
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });

  it('displays an error message on invalid login credentials', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
    await performLogin('user@example.com', 'wrongpassword');
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
