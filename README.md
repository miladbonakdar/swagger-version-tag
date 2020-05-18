# swagger-version-tag
 Generate a tag for each swagger endpoints


## Installing

Using npm: 
 
``globaly: ``
```bash
$ npm install -g swagger-version-tag
```
 
``localy: ``
```bash
$ npm install swagger-version-tag --save
```

## Command help
```bash
$ swagger-version-tag -h

Options:
  -V, --version                 output the version number
  -f, --file <file>             config file name. default is swagger-version-tag.json (default: "swagger-version-tag.json")
  -s, --service-name <service>  run command for specific service (default: "_all_")
  -c, --command <command>       command to run. default is gen (default: "gen")
  -o, --out <out>               output file. default is swagger-version-tag.out.json (default: "swagger-version-tag.out.json")
  -h, --help                    display help for command
```

__-s | --service-name:__ With this flag you can run the app just for one specific service.  

__-f | --file:__ It will change the default config file name.  

__-c | --command <tag | gen>:__ If you just want to check for new versions and status of the end points you can run with ``tag`` command but the default behaviour is ``gen`` command that will generate and change the output file.  


__-o | --out:__ It will change the default output file name.  

__!NOTE:__ You can run a command with multiple flags. For example:

```bash
$ swagger-version-tag -f in.json -s test-service -c tag
```
*It will just check status for the ``test-service`` service*

```bash
$ swagger-version-tag -o out.json -s test-service -c gen
```
*It will just generate the tag file for the ``test-service`` service and will save it in the ``out.json`` file*

## Sample Config File
Place a config file in the root of your project. Default name for the file is ``swagger-version-tag.json`` but you use any file name and change it by ``-f <file>`` flag in the command

```json
{
    "endPoints": [
        {
            "name": "backend-identity-v3",
            "url": "http://localhost:4002/swagger/v3/swagger.json",
            "language": "csharp",
            "packageName": "packageName",
            "moves": [
                {
                    "from": "./src/packageName/api/",
                    "to": "./packageName"
                },
                {
                    "from": "./src/packageName/Model/TokenResult.cs",
                    "to": "./packageName/models"
                }
            ],
            "deleteTempFolder": true
        }
    ]
}

```

## Sample Output File

```json
{
    "backend-identity-v3": {
        "date": 1589808084047,
        "hash": "e0c131bbc75aba3920f2b7b26f224f648f4b78eb77f4a563bd750657d6d34cb8",
        "message": "generate and all the moves completed for endpoint backend-identity-v3"
    }
}
```

