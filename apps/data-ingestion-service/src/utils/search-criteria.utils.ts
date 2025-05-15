import type { Filter } from 'mongodb';
import type { DataItem } from '../modules/data/interfaces/data-item.interface';

export function buildSearchCriteria(
  query?: string,
  title?: string,
  snippet?: string,
): Filter<DataItem> {
  if (query) {
    return {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { snippet: { $regex: query, $options: 'i' } },
      ],
    };
  } else if (title && snippet) {
    return {
      $and: [
        { title: { $regex: title, $options: 'i' } },
        { snippet: { $regex: snippet, $options: 'i' } },
      ],
    };
  } else if (title) {
    return { $text: { $search: title } };
  } else if (snippet) {
    return { snippet: { $regex: snippet, $options: 'i' } };
  }

  return {};
}
