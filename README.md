
<b>This is a repository for prototyping new ideas for future versions of <a href="http://wiki.synbiohub.org">SynBioHub</a>.</b>  The repository for the original SynBioHub is located at <a href="https://github.com/synbiohub/synbiohub">synbiohub/synbiohub</a>.

The master branch is currently trying out some major breaking changes.  For example:

* The codebase is now 100% [TypeScript](https://www.typescriptlang.org), with dependencies in TypeScript and JavaScript.  The Java components have been replaced with a TypeScript implementation using [sbolgraph](http://github.com/udp/sbolgraph), which is SBOL3-ready.
* Promises have been replaced with async/await.
* The views have been refactored to dramatically reduce the amount of code.  Views are now classes, which can derive from each other (e.g., `ViewComponentDefinition` derives from `ViewDescribingTopLevel` which derives from `ViewConcerningTopLevel`).  Each view now maintains an RDF graph, which is populated dynamically depending on which data is necessary to render the page (replacing the "fetch" methods from SynBioHub v1).  The graph can then be queried using the getters implemented by sbolgraph facade classes, meaning there is no longer any asynchronous logic in the page rendering.
* The dependency on sbolmeta has been removed.
* Support for design-built-test and provenance derived from [SynBioHub Lab](http://github.com/synbiohub/synbiohub-lab).
* New simplified design with cleaned up CSS (~1800 lines to ~1000 lines in synbiohub.less)
* Visualizer changed from VisBOL to [http://synbiocad.org](SynBioCAD) to enable rendering of compositional hierarchy, proportional features, etc.
* Ad-hoc URL/URI string manipulation has been completely replaced with a single, type-checked SBHURI class

Some features have also been removed pending reimplementation, for example:

* JBEI-ICE and Benchling integrations
* Upload options e.g. overwrite, merge implemented by the Java components



