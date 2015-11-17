# IndexCardVisualizations
Home of FRIES/PathwayCommon IndexCard alignment visualizations 

The following document shows TimeArcs visualization for Pathway Commons index cards. 

Time axis goes from left (2000) to right (2014). An arc connects two proteins/complexes at a particular time (based on when the interaction was discovered/ publication year). The colors encode interaction types: green for adds_modification, red for removes_modification, blue for translocation, orange for binds, and pink for increases. A black (and usually thicker) arcs indicates multiple interactions between two proteins/complexes are discovered in the same year (and probably in the same publication). The horizontal lines connect multiple occurrences of the same proteins/complexes in different publications.

![ScreenShot](http://www.cs.uic.edu/~tdang/TimeArcs/imagesForPCcards/summary.png)

For the same amount of data, we can use a force directed layout (without time element) to visualize as depicted in the following image. Over-plotting Protein/Complex labels obscure the base graph, and the labels themselves. In contrast, by organizing text labels vertically (and evenly spaced) and locating them horizontally at the first occurrence (first publication year) reduces the over-plotting problem significantly as depicted in the above picture.  

![ScreenShot](http://www.cs.uic.edu/~tdang/TimeArcs/imagesForPCcards/summary2.png)

When there are multiple connections (arcs) between two proteins/complexes, it may falls into one of the two following circumstances: (1) If they have the same color (same interaction type), they are supporting evidences in different publications which confirm the interaction between two elements. (2) If they have the different colors (different interaction types), the latter evidence may adds more knowledge or conflicting the previous publication. We will show an example of each circumstances in the next Section.
 
# Supporting evidences:
 
 ![ScreenShot](http://www.cs.uic.edu/~tdang/TimeArcs/imagesForPCcards/supporting.png)
 
# Conflicting evidences:
 