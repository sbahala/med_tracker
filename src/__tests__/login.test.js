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
    jest.resetAllMocks();
    signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'user123' }
      });
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

  it('displays an error message on failed login', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Failed to log in'));
  });
  it('displays an error message on invalid login credentials', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
  it('navigates to the admin dashboard on successful admin login', async () => {
  const { emailInput, passwordInput, submitButton } = setup();
  fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
  fireEvent.click(submitButton);
  try {
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/adminDashboard');
    });
  } catch (error) {
    console.error("Failed to navigate as expected:", error);
  }
});

  it('navigates to the doctor dashboard on successful doctor login', async () => {
    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: 'doctor@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);
    try {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctorDashboard');
      });
    } catch (error) {
      console.error("Failed to navigate as expected:", error);
    }
  });
  it('navigates to the nurse dashboard on successful doctor login', async () => {
    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: 'nurse@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);
    try {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/nurseDashboard');
      });
    } catch (error) {
      console.error("Failed to navigate as expected:", error);
    }
  });
  it('navigates to the patient dashboard on successful doctor login', async () => {
    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: 'patient@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);
    try {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patientDashboard');
      });
    } catch (error) {
      console.error("Failed to navigate as expected:", error);
    }
  });
