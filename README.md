# csv2dns
converts CSV to [DNS zone file](https://en.wikipedia.org/wiki/Zone_file)

# usage
Make sure that input CVS file has the following fields in the header row: ```Type, Host, Value, TTL, Priority```. 
Order isn't important, but column names are case-sensitive.
```
node index.js
```

Default input file name is ```dns.csv```

Also you can run it directly from the github

```
npx --yes https://github.com/zurgul/csv2dns.git
```

Result will be saved into dns.zone.txt
