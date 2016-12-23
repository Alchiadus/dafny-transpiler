method await(guard: bool)
  ensures guard;
  decreases *;
{
  while (!guard)
    decreases *;
  {
  }
}
