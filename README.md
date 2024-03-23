🍽️ ➡️ 📅

# Mealviewer-to-ICS

## Description
A Cloudflare Worker web service that converts the Mealviewer API to an ICS calendar document for easy viewing in a calendar app.

## Problem
I don't want to visit a website on a daily basis or print out a website to determine what my kids are eating for lunch.

## Request format
https://mealcal.meandmybadself.com/

Example:
https://mealcal.meandmybadself.com/?schoolId=EisenhowerElementaryMN&meal=Lunch

### Arguments
* `schoolId` - the Mealviewer school ID.  Default is `EisenhowerElementaryMN`.
* `meal` - `Lunch` or `Breakfast`. Default is `Lunch`.

## Response Notes
ICS has a TTL of one week.

## Reference URLs
* https://schools.mealviewer.com/school/EisenhowerElementaryMN
* https://api.mealviewer.com/api/v4/school/EisenhowerElementaryMN/2024-03-10/2024-04-09/0
* [Work Journal](https://docs.google.com/document/d/1WbL6oGrfDUGhfj9yyIPLWi-ifBvxLtrbx18uoN-5q-8/edit)