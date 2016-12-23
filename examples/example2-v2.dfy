// Use Owicki-Gries.

class Program
{
  var x: int;
  var a: bool;
  var b: bool;

  method Main()
  {
    assert x == 0 && a && b; // #POG
    // #parallel
    ProgramComponentA();
    ProgramComponentB();
    // #endparallel
    assert x == 2; // #QOG
  } // #endmethod Main

  method ProgramComponentA()
  {
    assert (x == 0 && a && b) || (x == 1 && a && !b); // #POG
    x, a := x + 1, false;
    assert (x == 1 && !a && b) || (x == 2 && !a && !b); // #QOG
  } // #endmethod ProgramComponentA

  method ProgramComponentB()
  {
    assert (x == 0 && a && b) || (x == 1 && !a && b); // #POG
    x, b := x + 1, false;
    assert (x == 1 && a && !b) || (x == 2 && !a && !b); // #QOG
  } // #endmethod ProgramComponentB
}
