🍽️ ➡️ 📅

# myschoolmenus-to-ICS

## Description
A Cloudflare Worker web service that converts the myschoolmenus API to an ICS calendar document for easy viewing in a calendar app.

## Problem
I don't want to visit a website on a daily basis or print out a website to determine what my kids are eating for lunch.

## Request format
https://mealcal.gregcochard.com/

Example:
https://mealcal.gregcochard.com/?districtId=136&menu=75181

### Arguments
* `districtId` - the myschoolmenus district ID.  Default is `136`.
* `menu` - the myschoolmenus menu ID. Default is `75181`.

## Response Notes
ICS has a TTL of one day.

## Credit
Originally forked from [Meandmybadself/mealviewer-to-ICS](https://github.com/Meandmybadself/mealviewer-to-ICS)

API reverse-engineered with the help of [andrewdefilippis/my-school-menus](https://github.com/andrewdefilippis/my-school-menus)
