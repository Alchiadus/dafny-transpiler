# Changelog

## 0.4.0

- Added support for Windows line-endings.
- Added support for Dafny method annotations, for example `decreases *;`.

## 0.3.0

- Fixed a soundness issue with local correctness.

  Previously, one local correctness method was generated for each program component. This version aims to guarantee soundness by generating a new method for each atomic statement of a program component.

## 0.2.0

- Improved naming scheme for local correctness methods:
  - Initialization and Finalization are no longer considered to be part of local correctness.
  - Local correctness methods have their corresponding parallel program component name in the name to easily recognize them.

## 0.1.0

- Initial release.
