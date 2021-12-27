from django.http import request
from django.http.response import HttpResponse
from django.shortcuts import render



def index(request):

    return render(request, 'index.html')

def lobby(request):

    return render(request, 'lobby-room.html')
