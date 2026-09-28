# Catalog sorting

> Reference spec for the workshop. It was produced with `/grill-me` followed by `/to-spec`. Yours can differ, and that is fine: the grilling session decides, not this file.

## Problem Statement

Players browsing the Tailspin Toys catalog cannot put the best-rated games first. The home page always lists games alphabetically, so finding the highest-rated games means scanning all 21 cards and comparing star ratings by eye, even after filtering.

## Solution

A **Sort by** control next to the existing filters lets players order the visible games by title (A–Z, the default), highest rated first, or lowest rated first. Sorting combines with the minimum-rating and category filters, is reflected in the URL so a sorted view can be shared, and the result-count line says which order is active.

## User Stories

1. As a player, I want to sort the catalog by highest rating, so that I see the best-rated games first.
2. As a player, I want to sort by lowest rating, so that I can find overlooked games.
3. As a player, I want the catalog to start in title order, so that the page looks the same as before unless I choose otherwise.
4. As a player, I want to switch back to "Title (A–Z)", so that every card returns to its original position.
5. As a player, I want sorting to apply to the games that match my filters, so that filtering and sorting work together.
6. As a player, I want "Clear filters" to keep my chosen order, so that clearing what is shown does not also reset how it is shown.
7. As a player, I want games with the same rating to appear in title order, so that the order is predictable.
8. As a player, I want unrated games to appear last in both rating orders, so that "no rating" is never mistaken for "lowest rating".
9. As a player, I want the sort to be part of the URL, so that I can share or bookmark a sorted view.
10. As a player opening a shared link, I want the sort control to show the order from the URL, so that the control and the list agree.
11. As a player opening a link with an unknown sort value, I want the default order, so that a bad link still works.
12. As a screen-reader user, I want the status line to mention the active order, so that I know the list changed.
13. As a keyboard user, I want the tab order to follow the visual order after sorting, so that navigation matches what I see.

## Implementation Decisions

- A new pure, framework-free sort module sits next to the filter module. Its public interface: the sort options with labels, a parser from URL query parameters, a writer that adds the sort to query parameters, a comparator, a function that returns a sorted copy, and a function that builds the result-count text.
- Sort values: `title-asc` (default, label "Title (A–Z)"), `rating-desc` ("Highest rated"), `rating-asc` ("Lowest rated").
- Query-string key: `sort`. The default is omitted from the URL, so an unsorted page keeps a plain URL. Unknown or missing values fall back to the default.
- Title comparison ignores case, and the default sort must reproduce the order the page already renders.
- Ratings compare numerically; ties are broken by title; unrated games always sort last.
- The home-page filter form gets a third native `<select>` labelled **Sort by**, placed after **Category** and before **Clear filters**.
- The browser script reorders the card elements in the grid (it does not use CSS `order`), so DOM order, tab order and visual order stay the same.
- The existing `role="status"` result-count line stays the single live region. For a non-default sort it reads, for example, `Showing 21 of 21 games, sorted by highest rated`; for the default sort the text is unchanged.
- **Clear filters** resets the rating and category filters but not the sort.

## Testing Decisions

- Good tests check behaviour through public interfaces: the sort module's functions and what the user sees on the page. They do not test private helpers or DOM internals.
- Unit seam: the sort module, with a co-located test file (prior art: the filter module's unit tests). Cover the parser (missing, valid, unknown values), the query writer (default omitted, filters preserved), both rating directions, tie-breaks, unrated games last, no mutation of the input, and the status text.
- Catalog seam: seed the real catalog as the filter catalog test does, and prove the default sort equals the rendered order.
- UI seam: a Playwright spec (prior art: the filters E2E spec) that covers the default order, "Highest rated" with its status text, sharing a sorted view through the URL, sort combined with a filter, and clearing filters while keeping the sort.

## Out of Scope

- Sorting by category, publisher or any field the catalog does not have (price, date, popularity).
- A separate ascending/descending toggle.
- Server-side sorting or changing the database query order.
- Remembering the sort anywhere other than the URL.

## Further Notes

- The catalog has no unrated games today, but the data model allows them, so the rule is still tested at the unit seam.
- Three games share a 3.0 rating, which makes the tie-break visible in "Lowest rated".
