using Domain.Entities;

namespace Application.Interfaces;

public interface IWeatherForecastService
{
    IEnumerable<WeatherForecast> GetForecasts(int days);
}
