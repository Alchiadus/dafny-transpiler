// Use Owicki-Gries.

include "await.dfy"

class Program
{
  var a: bool;
  var b: bool;
  var t: int;

  method Main()
  {
    assert !a && !b; // #POG
    // #parallel
    ProgramComponentA();
    ProgramComponentB();
    // #endparallel
    assert !a && !b; // #QOG
  } // #endmethod Main

  method ProgramComponentA()
    decreases *;
  {
    assert true; // #POG
    // Non-Critical section of A.
    a, t := true, 1;
    assert a; // #ROG
    await(!b || t == 2);
    assert a && (!b || t == 2); // #ROG
    // Critical section of A.
    a := false;
    assert !a; // #QOG
  } // #endmethod ProgramComponentA

  method ProgramComponentB()
    decreases *;
  {
    assert true; // #POG
    // Non-Critical section of B.
    b, t := true, 2;
    assert b; // #ROG
    await(!a || t == 1);
    assert b && (!a || t == 1); // #ROG
    // Critical section of B.
    b := false;
    assert !b; // #QOG
  } // #endmethod ProgramComponentB
}
