import { render } from "@testing-library/react";
import { RichTextEditor } from "./RichTextEditor";

// Since we can't properly mock a complex TipTap editor in JSDOM, we'll just test that the component renders
describe("RichTextEditor", () => {
  test("renders without crashing", () => {
    expect(() => {
      render(<RichTextEditor content="" onChange={jest.fn()} />);
    }).not.toThrow();
  });

  test("renders with initial content", () => {
    const { container } = render(
      <RichTextEditor content="<p>Test content</p>" onChange={jest.fn()} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
