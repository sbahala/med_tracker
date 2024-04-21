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
  return {
    ...jest.requireActual('firebase/auth'),
    signInWithEmailAndPassword: jest.fn((auth, email, password) => {
      const users = {
        'admin@example.com': { uid: 'admin123' },
        'doctor@example.com': { uid: 'doctor134' },
        'nurse@example.com': { uid: 'nurse135' },
        'patient@example.com': { uid: 'patient123' }
      };
      if (users[email] && password === 'correctpassword') {
        return Promise.resolve({ user: users[email] });
      } else {
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

  const performLogin = async (email, password) => {
    const { getByPlaceholderText, getByRole } = render(
      <Router>
        <Login />
      </Router>
    );
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: email } });
    fireEvent.change(getByPlaceholderText('Password'), { target: { value: password } });
    fireEvent.click(getByRole('button', { name: /login/i }));
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
});
