import React from 'react';
import { render, fireEvent, waitFor ,screen} from '@testing-library/react';
import Signup from '../pages/signup';
import { BrowserRouter as Router } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

jest.mock('firebase/auth', () => {
    const actualAuth = jest.requireActual('firebase/auth');
    return {
      ...actualAuth,
      getAuth: jest.fn(() => ({
      })),
      createUserWithEmailAndPassword: jest.fn(),
    };
  });

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({
    })),
    doc: jest.fn(),
    setDoc: jest.fn(),
  }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createUserWithEmailAndPassword.mockReset();
    setDoc.mockReset();
  });

  const setup = () => {
    const utils = render(
      <Router>
        <Signup />
      </Router>
    );
    const firstNameInput = utils.getByPlaceholderText('First Name');
    const lastNameInput = utils.getByPlaceholderText('Last Name');
    const emailInput = utils.getByPlaceholderText('Email');
    const passwordInput = utils.getByPlaceholderText('Password');
    const submitButton = utils.getByRole('button', { name: /sign up/i })
    return {
      ...utils,
      firstNameInput,
      lastNameInput,
      emailInput,
      passwordInput,
      submitButton,
    };
  };

  it('submits the form and navigates on successful sign up', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: '123' },
    });
    setDoc.mockResolvedValue();

    const { firstNameInput, lastNameInput, emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'john.doe@example.com',
            'password123'
        );
        expect(setDoc).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});

it('displays an error message on failed sign up', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Failed to sign up'));

    const { emailInput, passwordInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});

});
