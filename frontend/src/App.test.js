import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CV analyzer heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/AI CV Analyzer Pro/i);
  expect(headingElement).toBeInTheDocument();
});
