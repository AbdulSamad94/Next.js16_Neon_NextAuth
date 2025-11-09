import { cn } from './utils';

describe('Utility Functions', () => {
  test('cn function combines class names correctly', () => {
    // Test basic functionality
    expect(cn('class1', 'class2')).toBe('class1 class2');
    
    // Test with undefined values
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    
    // Test with falsy values
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
    
    // Test with null values
    expect(cn('class1', null, 'class2')).toBe('class1 class2');
    
    // Test with conditional classes
    expect(cn('class1', true && 'class2')).toBe('class1 class2');
    expect(cn('class1', false && 'class2')).toBe('class1');
  });

  test('cn function handles complex class combinations', () => {
    // Test with Tailwind classes
    expect(cn('p-4', 'm-2', 'text-lg')).toBe('p-4 m-2 text-lg');
    
    // Test with mixed class types
    expect(cn('p-4', undefined, 'm-2', null, 'text-lg')).toBe('p-4 m-2 text-lg');
  });
});