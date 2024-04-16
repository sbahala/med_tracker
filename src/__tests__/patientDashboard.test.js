import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import PatientDashboard from '../Components/Patients/PatientDashboard';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../firebase', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve('Signed out')),
  },
}));

jest.mock("../Components/service/appointmentService", () => ({
  isPatientProfileComplete: jest.fn(),
}));

const mockUser = {
  uid: '12345',
};

const renderWithProviders = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <AuthContext.Provider {...providerProps}>{ui}</AuthContext.Provider>,
    renderOptions
  );
};

const providerProps = {
  value: { currentUser: mockUser },
};

describe('PatientDashboard', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<PatientDashboard />, { providerProps });
    expect(getByText('Welcome to Patient Dashboard')).toBeInTheDocument();
  });

it('navigates on "Edit Account" button click', () => {
    const useNavigate = require('react-router-dom').useNavigate;
    const navigateMock = jest.fn();
    useNavigate.mockImplementation(() => navigateMock);
  
    const { getByText } = renderWithProviders(<PatientDashboard />, { providerProps });
    fireEvent.click(getByText('Edit Account'));
    expect(navigateMock).toHaveBeenCalledWith('/editPatientAccount');
  });
  
  it('navigates on "View Appointments Records" button click', () => {
    const useNavigate = require('react-router-dom').useNavigate;
    const navigateMock = jest.fn();
    useNavigate.mockImplementation(() => navigateMock);
  
    const { getByText } = renderWithProviders(<PatientDashboard />, { providerProps });
    fireEvent.click(getByText('View Appointments Records'));
    expect(navigateMock).toHaveBeenCalledWith('/appointmentRecords');
  });
  
  it('checks profile completeness on "Create Appointments" button click', async () => {
    const useNavigate = require('react-router-dom').useNavigate;
    const navigateMock = jest.fn();
    useNavigate.mockImplementation(() => navigateMock);
  
    const isPatientProfileComplete = require("../Components/service/appointmentService").isPatientProfileComplete;
    isPatientProfileComplete.mockImplementation(() => Promise.resolve({ isComplete: true }));
  
    const { getByText } = renderWithProviders(<PatientDashboard />, { providerProps });
    fireEvent.click(getByText('Create Appointments'));
  
    await waitFor(() => expect(isPatientProfileComplete).toHaveBeenCalledWith(mockUser.uid));
    expect(navigateMock).toHaveBeenCalledWith('/appointmentCreate');
  });
  
  it('calls sign out process on "Log Out" button click', async () => {
    const auth = require('../firebase').auth;
    const useNavigate = require('react-router-dom').useNavigate;
    const navigateMock = jest.fn();
    useNavigate.mockImplementation(() => navigateMock);
  
    const { getByText } = renderWithProviders(<PatientDashboard />, { providerProps });
    fireEvent.click(getByText('Log Out'));
  
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
  
});
