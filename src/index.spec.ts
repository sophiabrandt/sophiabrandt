import MarkdownIt from 'markdown-it';
import Parser from 'rss-parser';
import * as fs from 'fs';
import { BlogFeedException, WriteFileException, assertType } from './util';
import {
  BlogPostsGenerator,
  BlogPostsGeneratorConfig,
  MarkdownRenderer,
  RssParser,
  writeToFile,
} from './index';

describe('MarkdownRenderer', () => {
  it('returns rendered markdown', () => {
    const txt = '## Text';
    const rendered = '<h2>Text</h2>\n';
    const markdownItInstance = assertType<MarkdownIt>({
      render: vi.fn().mockReturnValue(rendered),
      use: vi.fn(),
    });
    const markdownRenderer = new MarkdownRenderer(markdownItInstance);

    expect(markdownRenderer.renderMarkdown(txt)).toBe(rendered);
    expect(markdownItInstance.render).toHaveBeenCalledWith(txt);
  });
});

describe('RssParser', () => {
  it('parses blog post items from RSS feed', async () => {
    const mockFeed = {
      items: [
        {
          title: 'my title',
          link: 'link to blog post',
          pubDate: '2022-01-01',
          content: 'content of the blog post',
        },
      ],
    };
    const parserInstance = assertType<Parser>({
      parseURL: vi.fn().mockReturnValue(mockFeed),
    });
    const rssParser = new RssParser(parserInstance);
    const url = 'https://example.com';

    const result = await rssParser.parseBlogFeedItems(url);

    expect(result).toBe(mockFeed.items);
    expect(parserInstance.parseURL).toHaveBeenCalledWith(`${url}/index.xml`);
  });

  it('throws BlogFeedException when parsing fails', async () => {
    const error = new Error('Parse error');
    const parserInstance = assertType<Parser>({
      parseURL: vi.fn().mockRejectedValue(error),
    });

    const rssParser = new RssParser(parserInstance);
    const url = 'https://example.com';

    await expect(rssParser.parseBlogFeedItems(url)).rejects.toThrow(
      BlogFeedException,
    );
    expect(parserInstance.parseURL).toHaveBeenCalledWith(`${url}/index.xml`);
  });
});

describe('BlogPostGenerator', () => {
  const getEmptyFeedItemsParser = (): Parser =>
    assertType<Parser>({
      parseURL: vi.fn().mockReturnValue({ items: [] }),
    });

  const getMockFeedParser = (): Parser => {
    const mockFeed = {
      items: [
        {
          title: 'my title',
          link: 'https://example.com/blog-post',
          pubDate: '2022-01-01',
          content: 'content of the blog post',
        },
      ],
    };

    return assertType<Parser>({
      parseURL: vi.fn().mockReturnValue(mockFeed),
    });
  };

  const setup = (parserStrategy: () => Parser) => {
    const blogpostsGeneratorConfig = new BlogPostsGeneratorConfig(
      {
        blogUrl: 'https://example.com',
        mastodonUrl: 'mastodon url',
        linkedInUrl: 'linkedIn url',
        devToUrl: 'dev.to url',
        websiteUrl: 'https://mywebsiteurl',
      },
      1,
      '20',
    );

    const parserInstance = parserStrategy();
    const rssParser = new RssParser(parserInstance);
    const blogPostsGenerator = new BlogPostsGenerator(
      blogpostsGeneratorConfig,
      rssParser,
    );

    return { blogPostsGenerator };
  };

  it('throws an exception when it fails', async () => {
    const { blogPostsGenerator } = setup(getEmptyFeedItemsParser);

    await expect(blogPostsGenerator.generateMdText()).rejects.toThrow(
      new BlogFeedException('Empty array is not allowed as input'),
    );
  });

  it('generates markdown from blog posts', async () => {
    const { blogPostsGenerator } = setup(getMockFeedParser);

    const result = await blogPostsGenerator.generateMdText();

    expect(result).toEqual(expect.stringContaining('# Hi. :wave'));

    expect(result).toEqual(
      expect.stringContaining(
        '<img src="https://img.shields.io/badge/mastodon-6364FF.svg?&style=for-the-badge&logo=mastodon&logoColor=white" height=20>',
      ),
    );
    expect(result).toEqual(
      expect.stringContaining(
        '<img src="https://img.shields.io/badge/linkedin-0077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" height=20>',
      ),
    );
    expect(result).toEqual(
      expect.stringContaining(
        '<img src="https://img.shields.io/badge/DEV.TO-0A0A0A.svg?&style=for-the-badge&logo=dev-dot-to&logoColor=white" height=20>',
      ),
    );

    expect(result).toEqual(
      expect.stringContaining(
        '<a href=https://example.com>:arrow_right: More blog posts</a>',
      ),
    );

    expect(result).toEqual(
      expect.stringContaining(
        `<ul>
        <li><a href="https://example.com/blog-post">my title</a> — 2022-01-01</li>
      </ul>`,
      ),
    );
  });
});

describe('writeToFile', () => {
  it('successfully writes to a file', async () => {
    vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    const filename = 'test.txt';
    const content = 'This is a test content';

    await expect(writeToFile(filename, content)).resolves.not.toThrow();
    expect(fs.promises.writeFile).toHaveBeenCalledWith(filename, content);
  });

  it('throws WriteFileException if writeFile fails', async () => {
    const error = new Error('writeFile failed');
    vi.spyOn(fs.promises, 'writeFile').mockRejectedValue(error);

    const filename = 'test.txt';
    const content = 'This is a test content';

    await expect(writeToFile(filename, content)).rejects.toThrow(
      new WriteFileException(error),
    );
    expect(fs.promises.writeFile).toHaveBeenCalledWith(filename, content);
  });
});
