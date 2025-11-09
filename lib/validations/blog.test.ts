import { createBlogSchema } from './blog';

describe('Blog Validation Schema', () => {
  test('validates correct blog data', () => {
    const validBlog = {
      title: 'My Blog Post That Is Adequate Length',
      content: '<p>This is my blog post content that is adequately long enough to pass the validation criteria that checks for minimum length</p>',
      coverImage: 'data:image/jpeg;base64,abcd1234',
      tags: ['tech', 'javascript']
    };

    const result = createBlogSchema.safeParse(validBlog);
    expect(result.success).toBe(true);
  });

  test('fails validation for empty title', () => {
    const invalidBlog = {
      title: '',
      content: '<p>This is my blog post content</p>',
      coverImage: 'data:image/jpeg;base64,...',
      tags: ['tech']
    };

    const result = createBlogSchema.safeParse(invalidBlog);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('title');
      expect(result.error.issues[0].message).toContain('characters'); // Expecting character count error
    }
  });

  test('fails validation for content that is too short', () => {
    const invalidBlog = {
      title: 'My Blog Post',
      content: '<p>Hi</p>', // Too short
      coverImage: 'data:image/jpeg;base64,...',
      tags: ['tech']
    };

    const result = createBlogSchema.safeParse(invalidBlog);
    expect(result.success).toBe(false);
  });

  test('fails validation for invalid cover image format', () => {
    const invalidBlog = {
      title: 'My Blog Post',
      content: '<p>This is my blog post content</p>',
      coverImage: 'not-a-valid-base64-string',
      tags: ['tech']
    };

    const result = createBlogSchema.safeParse(invalidBlog);
    expect(result.success).toBe(false);
  });

  test('fails validation for too many tags', () => {
    const invalidBlog = {
      title: 'My Blog Post',
      content: '<p>This is my blog post content</p>',
      coverImage: 'data:image/jpeg;base64,...',
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] // More than max
    };

    const result = createBlogSchema.safeParse(invalidBlog);
    expect(result.success).toBe(false);
  });

  test('fails validation for tags with invalid format', () => {
    const invalidBlog = {
      title: 'My Blog Post',
      content: '<p>This is my blog post content</p>',
      coverImage: 'data:image/jpeg;base64,...',
      tags: ['valid-tag', 'invalid tag with space'] // Space not allowed
    };

    const result = createBlogSchema.safeParse(invalidBlog);
    expect(result.success).toBe(false);
  });
});