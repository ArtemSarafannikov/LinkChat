### Link Chat

###### Dependencies: 

`pip install daphne`
`pip install django`
`pip install channels`

###### Run server: 
`daphne -p 8000 linkchat.asgi:application`

###### Collect all static files in one folder for daphne: 
`cd linkchat`
`python manage.py collectstatic `