# -*- coding: utf-8 -*-
"""
Created on Thu Jun  4 16:22:57 2020

@author: Natalie
"""

import os
import pickle
import pandas as pd
import numpy as np
import geopandas as gpd

from bokeh.io import output_file
from bokeh.plotting import figure, show
from bokeh.models import (BasicTicker, CDSView, ColorBar, ColumnDataSource,
                          CustomJS, CustomJSFilter, FactorRange, 
                          GeoJSONDataSource, HoverTool, Legend,
                          LinearColorMapper, PrintfTickFormatter, Slider)
from bokeh.layouts import row, column
from bokeh.models.widgets import Tabs, Panel
from bokeh.palettes import brewer
from bokeh.transform import transform

import click  # command-line interface
from yaml import load, dump, SafeLoader  # pyyaml library for reading the parameters.yml file


# ********
# PROGRAM ENTRY POINT
# Uses 'click' library so that it can be run from the command line
# ********
@click.command()
@click.option('-p', '--parameters_file',
              default="./model_parameters/default_dashboard.yml",
              type=click.Path(exists=True),
              help="Parameters file to use to configure the dashboard. Default: ./model_parameters/default_dashboard.yml")
def create_dashboard(parameters_file):
    # FUNCTIONS FOR PLOTTING
    # ----------------------
    
    # plot 1a: heatmap condition
    def plot_heatmap_condition(condition2plot):
        """ Create heatmap plot: x axis = time, y axis = MSOAs, colour = nr people with condition = condition2plot. condition2plot is key to conditions_dict."""
        
        # Prep data
        var2plot = msoacounts_dict[condition2plot]
        var2plot = var2plot.rename_axis(None, axis=1).rename_axis('MSOA', axis=0)
        var2plot.columns.name = 'Day'
        # reshape to 1D array or rates with a month and year for each row.
        df_var2plot = pd.DataFrame(var2plot.stack(), columns=['condition']).reset_index()
        source = ColumnDataSource(df_var2plot)
        # add better colour 
        mapper_1 = LinearColorMapper(palette=colours_ch_cond[condition2plot], low=0, high=var2plot.max().max())
        # create fig
        s1 = figure(title="Heatmap",
                   x_range=list(var2plot.columns), y_range=list(var2plot.index), x_axis_location="above")
        s1.rect(x="Day", y="MSOA", width=1, height=1, source=source,
               line_color=None, fill_color=transform('condition', mapper_1))
        color_bar_1 = ColorBar(color_mapper=mapper_1, location=(0, 0), orientation = 'horizontal', ticker=BasicTicker(desired_num_ticks=len(colours_ch_cond[condition2plot])))
        s1.add_layout(color_bar_1, 'below')
        s1.axis.axis_line_color = None
        s1.axis.major_tick_line_color = None
        s1.axis.major_label_text_font_size = "7px"
        s1.axis.major_label_standoff = 0
        s1.xaxis.major_label_orientation = 1.0
        # Create hover tool
        s1.add_tools(HoverTool(
            tooltips=[
                ( f'Nr {condition2plot}',   '@condition'),
                ( 'Day',  '@Day' ), 
                ( 'MSOA', '@MSOA'),
            ],
        ))
        s1.toolbar.autohide = False
        plotref_dict[f"hm{condition2plot}"] = s1    

    # plot 2: disease conditions across time
    def plot_cond_time():
        # build ColumnDataSource
        data_s2 = dict(totalcounts_dict)
        data_s2["days"] = days
        source_2 = ColumnDataSource(data=data_s2)
        # Create fig
        s2 = figure(background_fill_color="#fafafa",title="Time", x_axis_label='Time', y_axis_label='Nr of people',toolbar_location='above')
        legend_it = []
        for key, value in totalcounts_dict.items():
            c1 = s2.line(x = 'days', y = key, source = source_2, line_width=2, line_color=colour_dict[key],muted_color="grey", muted_alpha=0.2)   
            c2 = s2.square(x = 'days', y = key, source = source_2, fill_color=colour_dict[key], line_color=colour_dict[key], size=5, muted_color="grey", muted_alpha=0.2)
            legend_it.append((f"nr {key}", [c1,c2]))
        legend = Legend(items=legend_it)
        legend.click_policy="hide"
        # Misc
        tooltips = tooltips_cond_basic.copy()
        tooltips.append(tuple(( 'Day',  '@days' )))
        s2.add_tools(HoverTool(
            tooltips=tooltips,
        ))
        s2.add_layout(legend, 'right')
        s2.toolbar.autohide = False
        plotref_dict["cond_time"] = s2

    # plot 4a: choropleth
    def plot_choropleth_condition_slider(condition2plot):
        # Prepare data
        max_val = 0
        merged_data = pd.DataFrame()
        merged_data["y"] = msoacounts_dict[condition2plot].iloc[:,0]
        for d in range(0,nr_days):
            merged_data[f"{d}"] = msoacounts_dict[condition2plot].iloc[:,d]
            max_tmp = merged_data[f"{d}"].max()
            if max_tmp > max_val: max_val = max_tmp
        merged_data["Area"] = msoacounts_dict[condition2plot].index.to_list()
        merged_data = pd.merge(map_df,merged_data,on='Area')
        geosource = GeoJSONDataSource(geojson = merged_data.to_json())
        # Create color bar
        mapper_4 = LinearColorMapper(palette = colours_ch_cond[condition2plot], low = 0, high = max_val)
        color_bar_4 = ColorBar(color_mapper = mapper_4, 
                              label_standoff = 8,
                              #"width = 500, height = 20,
                              border_line_color = None,
                              location = (0,0), 
                              orientation = 'horizontal')
        # Create figure object.
        s4 = figure(title = f"{condition2plot} total")
        s4.xgrid.grid_line_color = None
        s4.ygrid.grid_line_color = None
        # Add patch renderer to figure.
        msoasrender = s4.patches('xs','ys', source = geosource,
                            fill_color = {'field' : 'y',
                                          'transform' : mapper_4},     
                            line_color = 'gray', 
                            line_width = 0.25, 
                            fill_alpha = 1)
        # Create hover tool
        s4.add_tools(HoverTool(renderers = [msoasrender],
                               tooltips = [('MSOA','@Area'),
                                            ('Nr people','@y'),
                                             ]))
        s4.add_layout(color_bar_4, 'below')
        s4.axis.visible = False
        s4.toolbar.autohide = True
        # Slider 
        # create dummy data source to store start value slider
        slider_val = {}
        slider_val["s"] = [start_day]
        source_slider = ColumnDataSource(data=slider_val)
        callback = CustomJS(args=dict(source=geosource,sliderval=source_slider), code="""
            var data = source.data;
            var startday = sliderval.data;
            var s = startday['s'];
            var f = cb_obj.value -s;
            console.log(f);
            var y = data['y'];
            var toreplace = data[f];
            for (var i = 0; i < y.length; i++) {
                y[i] = toreplace[i]
            }
            source.change.emit();
        """)
        slider = Slider(start=start_day, end=end_day, value=start_day, step=1, title="Day")
        slider.js_on_change('value', callback)
        plotref_dict[f"chpl{condition2plot}"] = s4
        plotref_dict[f"chsl{condition2plot}"] = slider
    
    def plot_cond_time_age():
        # 1 plot per condition, nr of lines = nr age brackets
        colour_dict_age = {
          0: "red",
          1: "orange",
          2: "yellow",
          3: "green",
          4: "teal",
          5: "blue",
          6: "purple",
          7: "pink",
          8: "gray",
          9: "black",
        }
        
        for key, value in totalcounts_dict.items():
            data_s2= dict()
            data_s2["days"] = days
            tooltips = []
            for a in range(len(age_cat_str)):
                data_s2[f"c{a}"] = agecounts_dict[key].iloc[a]
            source_2 = ColumnDataSource(data=data_s2)
            # Create fig
            s2 = figure(background_fill_color="#fafafa",title=f"{key}", x_axis_label='Time', y_axis_label=f'Nr of people - {key}',toolbar_location='above')
            legend_it = []
            for a in range(len(age_cat_str)):
                c1 = s2.line(x = 'days', y = f"c{a}", source = source_2, line_width=2, line_color=colour_dict_age[a],muted_color="grey", muted_alpha=0.2)   
                c2 = s2.square(x = 'days', y = f"c{a}", source = source_2, fill_color=colour_dict_age[a], line_color=colour_dict_age[a], size=5, muted_color="grey", muted_alpha=0.2)
                legend_it.append((f"nr {age_cat_str[a]}", [c1,c2]))
                tooltips.append(tuple(( f"{age_cat_str[a]}",  f"@c{a}" )))
                
            legend = Legend(items=legend_it)
            legend.click_policy="hide"
            # Misc    
            tooltips.append(tuple(( 'Day',  '@days' )))
            s2.add_tools(HoverTool(
                tooltips=tooltips,
            ))
            s2.add_layout(legend, 'right')
            s2.toolbar.autohide = False
            plotref_dict[f"cond_time_age_{key}"] = s2


    # MAIN SCRIPT
    # -----------
    
    # Set parameters (optional to overwrite defaults)
    # -----------------------------------------------
    # Set to None to use defaults
    
    base_dir = os.getcwd()  # get current directory (usually RAMP-UA)

    # from file
    # parameters_file = os.path.join(base_dir, "model_parameters","default_dashboard.yml")
    
    # read from file
    with open(parameters_file, 'r') as f:
        parameters = load(f, Loader=SafeLoader)
        dash_params = parameters["dashboard"]  # Parameters for the dashboard
        output_name_user = dash_params["output_name"]
        data_dir_user = dash_params["data_dir"]
        sc_dir = dash_params["scenario_dir"]
        sc_nam = dash_params["scenario_name"]
    
    # Set parameters (advanced)
    # -------------------------
    
    # dictionaries with condition and venue names
    # conditions are coded as numbers in microsim output
    conditions_dict = {
      "susceptible": 0,
      "exposed": 1,
      "presymptomatic": 2,
      "symptomatic": 3,
      "asymptomatic": 4,
      "recovered": 5,
      "dead": 6,
    }
    # venues are coded as strings - redefined here so script works as standalone, could refer to ActivityLocations instead
    locations_dict = {
      "PrimarySchool": "PrimarySchool",
      "SecondarySchool": "SecondarySchool",
      "Retail": "Retail",
      "Work": "Work",
      "Home": "Home",
    }
    
    # default list of tools for plots
    tools = "crosshair,hover,pan,wheel_zoom,box_zoom,reset,box_select,lasso_select"
    
    # colour schemes for plots
    # colours for line plots
    colour_dict = {
      "susceptible": "grey",
      "exposed": "blue",
      "presymptomatic": "orange",
      "symptomatic": "red",
      "asymptomatic": "magenta",
      "recovered": "green",
      "dead": "black",
      "Retail": "blue",
      "PrimarySchool": "orange",
      "SecondarySchool": "red",
      "Work": "black",
      "Home": "green",
    }
    # colours for heatmaps and choropleths for conditions (colours_ch_cond) and venues/danger scores (colours_ch_danger)
    colours_ch_cond = {
      "susceptible": brewer['Blues'][8][::-1],
      "exposed": brewer['YlOrRd'][8][::-1],
      "presymptomatic": brewer['YlOrRd'][8][::-1],
      "symptomatic": brewer['YlOrRd'][8][::-1],
      "asymptomatic": brewer['YlOrRd'][8][::-1],
      "recovered": brewer['Greens'][8][::-1],
      "dead": brewer['YlOrRd'][8][::-1],
    }

    # directory to read data from
    data_dir = "data" if (data_dir_user is None) else data_dir_user
    data_dir = os.path.join(base_dir, data_dir) # update data dir

    # base file name
    file_name = "opencl_dashboard" if (output_name_user is None) else output_name_user

    # Read in third party data
    # ------------------------
    
    # load in shapefile with England MSOAs for choropleth
    sh_file = os.path.join(data_dir, "MSOAS_shp","bcc21fa2-48d2-42ca-b7b7-0d978761069f2020412-1-12serld.j1f7i.shp")
    map_df = gpd.read_file(sh_file)
    # rename column to get ready for merging
    map_df.rename(index=str, columns={'msoa11cd': 'Area'},inplace=True)
    
    # postcode to MSOA conversion (for retail data)
    data_file = os.path.join(data_dir, "PCD_OA_LSOA_MSOA_LAD_AUG19_UK_LU.csv")
    postcode_lu = pd.read_csv(data_file, encoding = "ISO-8859-1", usecols = ["pcds", "msoa11cd"])
    
    # age brackets
    age_cat = np.array([[0, 19], [20, 29], [30,44], [45,59], [60,74], [75,200]])
    # label for plotting age categories
    age_cat_str = []
    for a in range(age_cat.shape[0]):
        age_cat_str.append(f"{age_cat[a,0]}-{age_cat[a,1]}")

    # Read in and process pickled output from microsim

    # load pickled data from OpenCL model
    opencl_data_dir = data_dir + "/output/OpenCL/"
    with open(opencl_data_dir + "total_counts.pkl", "rb") as f:
        totalcounts_dict = pickle.load(f)
    with open(opencl_data_dir + "age_counts.pkl", "rb") as f:
        agecounts_dict = pickle.load(f)
        for age_count_df in agecounts_dict.values():
            age_count_df['age_cat'] = age_cat_str
            age_count_df.set_index('age_cat', inplace=True)
    with open(opencl_data_dir + "area_counts.pkl", "rb") as f:
        msoacounts_dict = pickle.load(f)

        # store list of MSOAs from dataframe
        msoas = msoacounts_dict['susceptible'].index.values

    start_day = 0
    end_day = totalcounts_dict["susceptible"].shape[0]
    nr_days = end_day - start_day

    dict_days = []  # empty list for column names 'Day0' etc
    for d in range(start_day, end_day + 1):
        dict_days.append(f'Day{d}')

    # Plotting
    # --------
    
    # MSOA nrs (needs nrs not strings to plot)
    msoas_nr = [i for i in range(0,len(msoas))]
    
    # days (needs list to plot)
    days = [i for i in range(start_day,end_day)]
        
    # determine where/how the visualization will be rendered
    html_output = os.path.join(data_dir, f'{file_name}.html')
    output_file(html_output, title='RAMP-UA microsim output')  # Render to static HTML

    # optional: threshold map to only use MSOAs currently in the study or selection
    map_df = map_df[map_df['Area'].isin(msoas)]

    # basic tool tip for condition plots
    tooltips_cond_basic=[]
    for key, value in totalcounts_dict.items():
        tooltips_cond_basic.append(tuple(( f"Nr {key}",   f"@{key}")))

    # empty dictionary to track condition and venue specific plots
    plotref_dict = {}

    # create heatmaps condition
    for key,value in conditions_dict.items():
        plot_heatmap_condition(key)

    # disease conditions across time
    plot_cond_time()

    # disease conditions across msoas
    # plot_cond_msoas()

    # choropleth conditions
    for key,value in conditions_dict.items():
        plot_choropleth_condition_slider(key)

    # conditions across time per age category
    plot_cond_time_age()

    # Layout and output

    # tab1 = Panel(child=row(plotref_dict["cond_time"], plotref_dict["cond_msoas"]), title='Summary conditions')
    tab2 = Panel(child=row(plotref_dict["hmsusceptible"],column(plotref_dict["chslsusceptible"],plotref_dict["chplsusceptible"])), title='Susceptible')
    tab3 = Panel(child=row(plotref_dict["hmexposed"],column(plotref_dict["chslexposed"],plotref_dict["chplexposed"])), title='Exposed')
    tab4 = Panel(child=row(plotref_dict["hmpresymptomatic"],column(plotref_dict["chslpresymptomatic"],plotref_dict["chplpresymptomatic"])), title='Presymptomatic')
    tab5 = Panel(child=row(plotref_dict["hmsymptomatic"],column(plotref_dict["chslsymptomatic"],plotref_dict["chplsymptomatic"])), title='Symptomatic')
    tab6 = Panel(child=row(plotref_dict["hmasymptomatic"],column(plotref_dict["chslasymptomatic"],plotref_dict["chplasymptomatic"])), title='Asymptomatic')
    tab7 = Panel(child=row(plotref_dict["hmrecovered"],column(plotref_dict["chslrecovered"],plotref_dict["chplrecovered"])), title='Recovered')
    tab8 = Panel(child=row(plotref_dict["hmdead"],column(plotref_dict["chsldead"],plotref_dict["chpldead"])), title='Dead')
    tab9 = Panel(child=row(plotref_dict["cond_time_age_susceptible"],plotref_dict["cond_time_age_presymptomatic"],plotref_dict["cond_time_age_symptomatic"],plotref_dict["cond_time_age_recovered"],plotref_dict["cond_time_age_dead"]), title='Breakdown by age')

    # Put the Panels in a Tabs object
    tabs = Tabs(tabs=[tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9])

    show(tabs)


if __name__ == "__main__":
    create_dashboard()
    print("End of program")
