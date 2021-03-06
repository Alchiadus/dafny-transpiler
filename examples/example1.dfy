// Use Owicki-Gries.

class Program
{
  var x: int;

  method Main()
  {
    assert x == 0; // #POG
    // #parallel
    ProgramComponentA();
    ProgramComponentB();
    // #endparallel
    assert x == 3; // #QOG
  } // #endmethod Main

  method ProgramComponentA()
  {
    assert x == 0 || x == 2; // #POG
    x := x + 1;
    assert x == 1 || x == 3; // #QOG
  } // #endmethod ProgramComponentA

  method ProgramComponentB()
  {
    assert x == 0 || x == 1; // #POG
    x := x + 2;
    assert x == 2 || x == 3; // #QOG
  } // #endmethod ProgramComponentB
}
