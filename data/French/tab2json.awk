# awk -f tab2json.awk lefff-word-tag.txt
BEGIN	{
  print "["
}
{
  pos = "\"" $2 "\""
  for (i = 3; i <= NF; i++) {
    pos = pos ", \"" $i "\""
  }
  print "  \"" $1 "\": [" pos "],"
}
END	{
  print "]"
}
