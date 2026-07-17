using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IWeatherForecastService _weatherForecastService;

    public WeatherForecastController(IWeatherForecastService weatherForecastService)
    {
        _weatherForecastService = weatherForecastService;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public IActionResult Get()
    {
        var forecasts = _weatherForecastService.GetForecasts(5);
        return Ok(forecasts);
    }
}
