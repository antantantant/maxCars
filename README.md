backup of my car website, written for Google App Engine, in JAVA. Need to set up GAE locally for debugging.

Clien side codes are under ./war (do not change folder name)
main entrance: ./war/hello.html
all scripts are under ./war/scripts
uses an old version of THREE.js for rendering 3D objects, may need some updates there

Server side codes are under ./src
See ./src/search/Algorithm.java first
The training follows Dr. Joachim's ranking svm, the underlying optimization algorithm follows "R.-E. Fan, P.-H. Chen, and C.-J. Lin. Working set selection using the second order information for training SVM. Journal of Machine Learning Research 6, 1889-1918, 2005"

The generation of new cars is based on EGO, using SVM model as an input prediction. GA is used to optimize the expected improvement (sort of...). GA generation size is reduced to achieve real-time server response.
