import { render, screen } from '@testing-library/react';
import App from './App';

test('renders volunteer management system', () => {
  render(<App />);
  const linkElement = screen.getByText(/volunteerconnect/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders landing page by default', () => {
  render(<App />);
  // Test for landing page elements
  const heading = screen.getByText(/connecting volunteers/i);
  expect(heading).toBeInTheDocument();
});
