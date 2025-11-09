import '@testing-library/jest-dom';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args: any[]) => {
      return {
        json: () => Promise.resolve(args[0]),
        status: args[1]?.status || 200,
      };
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));