csplit -s fly.toml '/app = .*/1'
cat xx00 > fly.toml
sed '/^#.*/d' fly.template.toml >> fly.toml
rm xx0[01]