# model_parameters

The model can read a parameters file. 

By default, it will read the parameters file called: `default.json`.

If you would rather read another file, create one in this directory and use the `--parameters-file` (or `-pf`) arguments:

```
python microsim/microsim_model.py -pf model_parameters/my_scenario.json
```

If you want to use the command-line arguments instead of reading a parameters file, you have to set the `--no-parameters-file` (or `-npf`) argument. E.g.:

```
python microsim/microsim_model.py  --repetitions=80 ... 
```

