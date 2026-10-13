# Judge-facing static dashboard

`index.html` is the standalone v7.2 manufacturing assurance UI, committed as the visual and interaction baseline. It includes the nine fictional AI systems, their drill-downs, 45-control display, guidance and interactive local actions.

The companion fixture outputs are in `../data/generated` and constitute the **reproducible data/expected-outcome baseline**. The existing HTML uses embedded data, not a live `fetch()` of those artifacts. The implementation phase should connect this to the generated contract through one read-only adapter rather than build a second synthetic decision engine in the browser.

A known v7.2 header inconsistency ($48,200 versus the sum $44,100) is corrected in the committed reference display. No HTML action is connected to real HAIEC evaluation, factory control, email or database mutation.
